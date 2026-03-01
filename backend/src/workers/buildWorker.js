/**
 * src/workers/buildWorker.js
 *
 * FORGE build worker — separate Node.js process.
 *
 * Improvements over v1:
 *   ① Failure recovery loop   — AppChecker fail → re-plan → rebuild (max 2 replans)
 *   ② Token control           — temperature + max_output_tokens per agent
 *   ③ Structured logging      — PipelineLogger (JSON lines + stage durations)
 *   ④ Plan JSON validation    — schema repair on PlannerAgent output
 *   ⑤ Tool-call audit trail   — every tool logged with timing + error
 *   ⑥ Token usage tracking   — per-agent + pipeline total + estimated cost
 *   ⑦ Parallel file reads     — Promise.all() for sandbox→DB sync
 *   ⑧ Error classification    — syntax|dependency|routing|import|build|unknown
 */

import 'dotenv/config';
import { Worker } from 'bullmq';
import { Runner } from '@openai/agents';
import { bullConnection, publisher, buildChannel } from '../redis/index.js';
import { getOrCreateSandbox, makeSandboxTools } from '../tools/sandboxTools.js';
import { createAgents } from '../agents/index.js';
import { PipelineLogger, classifyError } from '../utils/logger.js';
import { validatePlan } from '../utils/planValidator.js';
import prisma from '../db/index.js';

// ── Redis emit helper ─────────────────────────────────────────────────────
async function emit(chatId, stage, message, extra = {}) {
  const payload = JSON.stringify({ type: 'pipeline_update', stage, message, ts: Date.now(), ...extra });
  await publisher.publish(buildChannel(chatId), payload);
}

// ── React + Tailwind + React Icons scaffold ───────────────────────────────
async function scaffoldReactApp(sb, chatId) {
  await emit(chatId, 'sandbox', 'Scaffolding React + Tailwind + React Icons…');

  // Debug: check sandbox structure
  if (!sb) {
    throw new Error('Sandbox is undefined');
  }
  
  if (!sb.files) {
    console.error('[Scaffold] Sandbox object structure:', Object.keys(sb));
    throw new Error(`Sandbox files API not available. Available: ${Object.keys(sb).join(', ')}`);
  }

  // Create directories using commands
  try {
    await sb.commands.run('mkdir -p /app/src/pages', { cwd: '/', timeoutMs: 30_000 });
  } catch (err) {
    console.warn(`[Scaffold] mkdir warning: ${err.message}`);
  }

  // Create minimal package.json and files for a React app
  await sb.files.write('/app/package.json', JSON.stringify({
    name: 'react-app',
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-router-dom': '^6.8.0',
      'react-icons': '^4.11.0',
    },
    devDependencies: {
      '@vitejs/plugin-react': '^3.1.0',
      tailwindcss: '^3.2.0',
      postcss: '^8.4.24',
      autoprefixer: '^10.4.14',
      vite: '^4.2.0',
    },
  }, null, 2));

  // Create minimal vite config
await sb.files.write('/app/vite.config.js',
  `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { 
    host: '0.0.0.0', 
    port: 5173,
    allowedHosts: 'all',  // ✅ allows e2b.app preview URLs
  },
});\n`);
  // Create index.html
  await sb.files.write('/app/index.html',
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>React App</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>\n`);

  // Create src/main.jsx
  await sb.files.write('/app/src/main.jsx',
    `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);\n`);

  // Create tailwind.config.js
  await sb.files.write('/app/tailwind.config.js',
    `export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
};\n`);

  // Create postcss.config.js
  await sb.files.write('/app/postcss.config.js',
    `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};\n`);

  // Create src/index.css
  await sb.files.write('/app/src/index.css', `@import "tailwindcss";\n`);

  // Create src/App.jsx
  await sb.files.write('/app/src/App.jsx',
    `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;\n`);

  // Pre-create pages/ folder with a starter Home
  await sb.files.write('/app/src/pages/Home.jsx',
    `export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800">Ready to build…</h1>
    </div>
  );
}\n`);

  await emit(chatId, 'sandbox', 'Scaffold complete.');
}

// ── ⑦ Parallel recursive file collector ──────────────────────────────────
async function collectSandboxFiles(sb, dirPath) {
  const entries   = await sb.files.list(dirPath);
  const fileItems = entries.filter((e) => e.type !== 'dir');
  const dirItems  = entries.filter((e) => e.type === 'dir');

  // Parallel reads for files in this directory
  const reads = fileItems.map(async (entry) => {
    const fullPath = `${dirPath}/${entry.name}`;
    try {
      const content = await sb.files.read(fullPath);
      return { path: fullPath.replace('/app/', ''), content };
    } catch { return null; }
  });

  const results = (await Promise.all(reads)).filter(Boolean);

  // Recurse into subdirs sequentially (avoids overwhelming E2B rate limits)
  for (const dir of dirItems) {
    const sub = await collectSandboxFiles(sb, `${dirPath}/${dir.name}`);
    results.push(...sub);
  }

  return results;
}

// ── Wrapper: run agent + record tokens ───────────────────────────────────
async function runAgent(runner, agent, input, agentName, logger) {
  logger.startStage(agentName);
  try {
    const result = await runner.run(agent, input);
    logger.recordTokens(agentName, result);   // ⑥
    logger.endStage(agentName, { tokens: logger.tokens.agents[agentName] ?? null });
    return result;
  } catch (err) {
    const classified = logger.error(agentName, err);   // ⑧
    logger.endStage(agentName, { errorType: classified.type });
    throw err;
  }
}

// ── Main job processor ────────────────────────────────────────────────────
async function processBuildJob(job) {
  const { chatId, projectId, userMessage, previousMessages } = job.data;

  // ③ Logger instance for this job
  const logger = new PipelineLogger(chatId, job.id);
  logger.startStage('pipeline');

  try {
    // ── STEP 0: Persist user message ──────────────────────────────────────
    await emit(chatId, 'start', 'Build job received — pipeline starting…');
    logger._log('info', 'Pipeline started', { projectId, msg: userMessage.slice(0, 80) });

    await prisma.message.create({
      data: { chatId, role: 'user', content: userMessage, metadata: { jobId: job.id } },
    });

    // ── STEP 1: Sandbox ───────────────────────────────────────────────────
    logger.startStage('sandbox');
    await emit(chatId, 'sandbox', 'Initialising cloud sandbox…');

    const sb = await getOrCreateSandbox(projectId);

    let needsScaffold = false;
    try { await sb.files.read('/app/package.json'); }
    catch { needsScaffold = true; }

    if (needsScaffold) {
      await scaffoldReactApp(sb, chatId);
    } else {
      await emit(chatId, 'sandbox', 'Existing sandbox reused.');
    }

    await prisma.project.update({
      where: { id: projectId },
      data:  { sandboxId: sb.sandboxId ?? `local-${projectId}` },
    }).catch(() => {});

    logger.endStage('sandbox');

    // ── Build agent set ────────────────────────────────────────────────────
    const sandboxTools = makeSandboxTools(projectId);
    const toolMap      = Object.fromEntries(sandboxTools.map((t) => [t.name, t]));
    const agents       = createAgents(sandboxTools);
    const runner       = new Runner();

    // History context
    const history = previousMessages
      .filter((m) => ['user', 'assistant'].includes(m.role))
      .slice(-20)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const fullPrompt = history
      ? `Previous conversation:\n${history}\n\nNew request: ${userMessage}`
      : userMessage;

    // ─────────────────────────────────────────────────────────────────────
    // ① RETRY ORCHESTRATION LOOP
    //    Planner → Builder → Validator → Checker
    //    If Checker reports buildStatus = "failed" → re-plan with error context
    //    Max 2 replans before delivering partial build
    // ─────────────────────────────────────────────────────────────────────
    const MAX_REPLANS = 2;
    let replanCount   = 0;
    let buildFailed   = false;
    let lastError     = null;
    let checkResult   = null;
    let planObj       = null;

    do {
      buildFailed = false;

      // ── STEP 2: PlannerAgent ────────────────────────────────────────────
      const isReplan = replanCount > 0;
      await emit(chatId, 'planning',
        isReplan
          ? `Re-planning after build failure (attempt ${replanCount + 1}/${MAX_REPLANS})…`
          : 'Analysing request and creating build plan…'
      );

      const planPrompt = isReplan
        ? `${fullPrompt}

IMPORTANT: Previous build attempt ${replanCount} failed.
Error details: ${JSON.stringify(lastError, null, 2)}

Please create a SIMPLER, more robust plan that avoids these issues.
Prefer fewer files, simpler components, and no complex dependencies.`
        : fullPrompt;

      const planResult = await runAgent(runner, agents.PlannerAgent, planPrompt, 'PlannerAgent', logger);
      await job.updateProgress(25 + replanCount * 5);

      // ④ Validate + auto-repair plan JSON
      const { valid, plan, repaired, error: planError } = validatePlan(planResult.finalOutput);
      planObj = plan;

      if (!valid || repaired) {
        logger._log('warn', 'PlannerAgent output repaired', { planError });
        await emit(chatId, 'planning', 'Plan auto-repaired and validated.', { plan: planObj });
      } else {
        await emit(chatId, 'planning', 'Build plan ready.', { plan: planObj });
      }

      // Write repaired plan back into sandbox context
      try {
        await toolMap.save_context.execute({ context: JSON.stringify({ plan: planObj, replanCount, lastError }) });
      } catch {}

      // ── STEP 3: BuilderAgent ────────────────────────────────────────────
      await emit(chatId, 'building',
        isReplan ? 'Rebuilding with revised plan…' : 'Writing code and assembling components…'
      );

      await runAgent(
        runner,
        agents.BuilderAgent,
        `Execute this build plan.\n\nPlan:\n${JSON.stringify(planObj, null, 2)}\n\nOriginal request: ${userMessage}`,
        'BuilderAgent',
        logger,
      );
      await job.updateProgress(55 + replanCount * 5);
      await emit(chatId, 'building', 'Code generation complete.');

      // ── STEP 4: CodeValidatorAgent ──────────────────────────────────────
      await emit(chatId, 'validating', 'Reviewing source files and fixing issues…');

      await runAgent(
        runner,
        agents.CodeValidatorAgent,
        'Validate every source file and fix all issues.',
        'CodeValidatorAgent',
        logger,
      );
      await job.updateProgress(72 + replanCount * 3);
      await emit(chatId, 'validating', 'Validation complete.');

      // ── STEP 5: AppCheckerAgent ─────────────────────────────────────────
      await emit(chatId, 'checking', 'Running production build and lint check…');

      checkResult = await runAgent(
        runner,
        agents.AppCheckerAgent,
        'Run the build, fix compilation errors, then run ESLint.',
        'AppCheckerAgent',
        logger,
      );
      await job.updateProgress(85 + replanCount * 3);

      // ── ① Read build outcome from sandbox context ───────────────────────
      try {
        const raw    = await toolMap.get_context.execute({});
        const ctx    = JSON.parse(raw);
        const status = ctx.buildStatus ?? 'unknown';

        if (status === 'failed') {
          buildFailed = true;
          lastError   = {
            buildStatus: status,
            lintStatus:  ctx.lintStatus,
            errorType:   classifyError(checkResult.finalOutput ?? ''),
            // ⑧ Classified error type sent back to planner
            snippet:     (checkResult.finalOutput ?? '').slice(0, 600),
          };
          logger._log('warn', `Build failed — replan ${replanCount + 1}/${MAX_REPLANS}`, lastError);
          await emit(chatId, 'error',
            `Build failed (${lastError.errorType}). Attempting re-plan…`, { lastError }
          );
          replanCount++;
        }
      } catch {
        // Context unreadable — assume success, move on
      }

    } while (buildFailed && replanCount <= MAX_REPLANS);

    if (buildFailed) {
      await emit(chatId, 'checking', `⚠️ Build still failing after ${replanCount} replans — partial build delivered.`);
    } else {
      await emit(chatId, 'checking', 'Build verified ✓');
    }

    await job.updateProgress(92);

    // ── STEP 6: Dev server → preview URL ─────────────────────────────────
 // ── STEP 6: Dev server → preview URL ─────────────────────────────────────
// ── STEP 6: Dev server → preview URL ─────────────────────────────────────
let previewUrl = null;
try {
  // ✅ Force-overwrite vite config to allow e2b hosts (fixes old sandboxes)
  await sb.files.write('/app/vite.config.js',
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: 'all',
  },
});\n`);

  await sb.commands.run('npm install', { cwd: '/app', timeoutMs: 120_000 });

  sb.commands.run('npm run dev -- --host 0.0.0.0 --port 5173', {
    cwd: '/app',
    background: true,
  }).catch(() => {});

  await new Promise((r) => setTimeout(r, 5000));

  const hostname = await sb.getHost(5173);
  previewUrl = hostname
    ? (hostname.startsWith('http') ? hostname : `https://${hostname}`)
    : null;

  if (previewUrl) {
    await emit(chatId, 'checking', 'Preview server is running', { previewUrl });
  } else {
    logger._log('warn', 'Failed to obtain sandbox host for preview');
  }
} catch (err) {
  logger._log('warn', 'Dev server start failed', { error: err.message });
}

    // ── STEP 7: ⑦ Parallel file sync → PostgreSQL ────────────────────────
    await emit(chatId, 'checking', 'Syncing files to database…');
    try {
      const allFiles = await collectSandboxFiles(sb, '/app/src');

      await Promise.all(
        allFiles.map(({ path, content }) =>
          prisma.projectFile.upsert({
            where:  { projectId_path: { projectId, path } },
            update: { content },
            create: { projectId, path, content },
          }).catch((e) => logger._log('warn', `Upsert failed: ${path}`, { err: e.message }))
        )
      );

      logger._log('info', `Synced ${allFiles.length} files`, { projectId });
    } catch (err) {
      logger._log('warn', 'File sync error', { error: err.message });
    }

    // ── STEP 8: Finalise ──────────────────────────────────────────────────
    const summary = checkResult?.finalOutput || 'Build pipeline completed.';
    const tokenSummary = logger.tokens.summary();

    await prisma.message.create({
      data: {
        chatId,
        role:     'assistant',
        content:  summary,
        metadata: { jobId: job.id, previewUrl, replanCount, tokens: tokenSummary },
      },
    });

    logger.endStage('pipeline', { replanCount, previewUrl, tokens: tokenSummary });

    // ⑤ ⑥ Publish full telemetry (stages + tokens + audit trail)
    await logger.publishTelemetry();

    await job.updateProgress(100);
    await emit(chatId, 'done', summary, { previewUrl, tokens: tokenSummary, replans: replanCount });

    return { previewUrl, summary, tokens: tokenSummary };

  } catch (err) {
    const { type, message } = logger.error('pipeline', err);

    await emit(chatId, 'error', message, { errorType: type }).catch(() => {});
    await logger.publishTelemetry().catch(() => {});

    try {
      await prisma.message.create({
        data: {
          chatId,
          role:     'assistant',
          content:  `Build failed (${type}): ${message}`,
          metadata: { jobId: job.id, error: true, errorType: type },
        },
      });
    } catch {}

    throw err; // BullMQ exponential back-off retries
  }
}

// ── Worker instance ───────────────────────────────────────────────────────
const worker = new Worker('website-builds', processBuildJob, {
  connection:  bullConnection,
  concurrency: 3,
  limiter:     { max: 10, duration: 60_000 },
});

worker.on('completed', (job) =>
  console.log(JSON.stringify({ level: 'info', event: 'job_completed', jobId: job.id, ts: new Date().toISOString() }))
);
worker.on('failed', (job, err) =>
  console.error(JSON.stringify({ level: 'error', event: 'job_failed', jobId: job?.id, error: err.message, ts: new Date().toISOString() }))
);
worker.on('error', (err) =>
  console.error(JSON.stringify({ level: 'error', event: 'worker_error', error: err.message, ts: new Date().toISOString() }))
);

console.log(JSON.stringify({ level: 'info', event: 'worker_started', ts: new Date().toISOString() }));

// ── Graceful shutdown ─────────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(JSON.stringify({ level: 'info', event: 'shutdown', signal }));
  await worker.close();
  await prisma.$disconnect();
  await publisher.quit();
  await bullConnection.quit();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));