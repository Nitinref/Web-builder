import { Sandbox } from 'e2b';
import { z } from 'zod';

// ── Sandbox registry: projectId → Sandbox instance ────────────────────────
const sandboxRegistry = new Map();

/**
 * Return an existing sandbox (if alive) or create a new one.
 */
export async function getOrCreateSandbox(projectId) {
  const existing = sandboxRegistry.get(projectId);
  if (existing) {
    try {
      await existing.files.list('/');
      return existing;
    } catch {
      sandboxRegistry.delete(projectId);
    }
  }

  const sb = await Sandbox.create(process.env.E2B_TEMPLATE_ID || 'base', {
    apiKey:    process.env.E2B_API_KEY,
    timeoutMs: 10 * 60 * 1000,
  });

  sandboxRegistry.set(projectId, sb);
  console.log(`[Sandbox] Created new sandbox for project ${projectId}: ${sb.sandboxId}`);
  return sb;
}

/**
 * Kill and remove sandbox for a project.
 */
export async function killSandbox(projectId) {
  const sb = sandboxRegistry.get(projectId);
  if (sb) {
    try { await sb.kill(); } catch {}
    sandboxRegistry.delete(projectId);
    console.log(`[Sandbox] Killed sandbox for project ${projectId}`);
  }
}

/** Ensure path is absolute under /app */
function abs(p) {
  if (!p) return '/app';
  if (p.startsWith('/')) return p;
  return `/app/${p}`;
}

// ── Tool factory ────────────────────────────────────────────────────────────
// Returns plain objects { name, description, parameters, execute }
// Compatible with buildWorker.js toLangChainTools()

export function makeSandboxTools(projectId) {
  const getSb = () => getOrCreateSandbox(projectId);

  return [

    // 1. create_file
    {
      name: 'create_file',
      description: 'Create or overwrite a file with the given content.',
      parameters: z.object({
        path:    z.string().describe('File path (relative to /app or absolute)'),
        content: z.string().describe('File content'),
      }),
      execute: async ({ path, content }) => {
        const sb = await getSb();
        const p  = abs(path);
        await sb.files.write(p, content);
        return JSON.stringify({ success: true, path: p });
      },
    },

    // 2. read_file
    {
      name: 'read_file',
      description: 'Read and return the content of a file.',
      parameters: z.object({
        path: z.string().describe('File path'),
      }),
      execute: async ({ path }) => {
        const sb      = await getSb();
        const p       = abs(path);
        const content = await sb.files.read(p);
        return JSON.stringify({ path: p, content });
      },
    },

    // 3. write_multiple_files
    {
      name: 'write_multiple_files',
      description: 'Write several files in one call.',
      parameters: z.object({
        files: z.array(z.object({
          path:    z.string(),
          content: z.string(),
        })).describe('Array of { path, content }'),
      }),
      execute: async ({ files }) => {
        const sb      = await getSb();
        const results = [];
        for (const { path, content } of files) {
          const p = abs(path);
          await sb.files.write(p, content);
          results.push({ path: p, success: true });
        }
        return JSON.stringify({ results });
      },
    },

    // 4. delete_file
    {
      name: 'delete_file',
      description: 'Delete a file from the sandbox.',
      parameters: z.object({
        path: z.string().describe('File path to delete'),
      }),
      execute: async ({ path }) => {
        const sb = await getSb();
        const p  = abs(path);
        await sb.files.remove(p);
        return JSON.stringify({ success: true, path: p });
      },
    },

    // 5. list_directory
    {
      name: 'list_directory',
      description: 'List entries in a directory.',
      parameters: z.object({
        path: z.string().default('/app').describe('Directory path'),
      }),
      execute: async ({ path }) => {
        const sb      = await getSb();
        const p       = abs(path);
        const entries = await sb.files.list(p);
        return JSON.stringify({ path: p, entries });
      },
    },

    // 6. execute_command
    {
      name: 'execute_command',
      description: 'Run a shell command and return stdout/stderr/exitCode.',
      parameters: z.object({
        cmd:       z.string().describe('Shell command'),
        cwd:       z.string().default('/app').describe('Working directory'),
        timeoutMs: z.number().default(60_000).describe('Timeout in ms'),
      }),
      execute: async ({ cmd, cwd, timeoutMs }) => {
        const sb     = await getSb();
        const result = await sb.commands.run(cmd, {
          cwd: abs(cwd),
          timeoutMs,
        });
        return JSON.stringify({
          stdout:   result.stdout,
          stderr:   result.stderr,
          exitCode: result.exitCode,
        });
      },
    },

    // 7. test_build
    {
      name: 'test_build',
      description: 'Run `npm run build` in /app and return the result.',
      parameters: z.object({}),
      execute: async () => {
        const sb     = await getSb();
        const result = await sb.commands.run('npm run build', {
          cwd:       '/app',
          timeoutMs: 120_000,
        });
        return JSON.stringify({
          success:  result.exitCode === 0,
          stdout:   result.stdout,
          stderr:   result.stderr,
          exitCode: result.exitCode,
        });
      },
    },

    // 8. check_missing_packages
    {
      name: 'check_missing_packages',
      description: 'Install one or more npm packages in /app.',
      parameters: z.object({
        packages: z.array(z.string()).describe('Package names to install'),
      }),
      execute: async ({ packages }) => {
        if (!packages.length) return JSON.stringify({ success: true, installed: [] });
        const sb     = await getSb();
        const result = await sb.commands.run(`npm install ${packages.join(' ')}`, {
          cwd:       '/app',
          timeoutMs: 120_000,
        });
        return JSON.stringify({
          success:   result.exitCode === 0,
          installed: packages,
          stdout:    result.stdout,
          stderr:    result.stderr,
        });
      },
    },

    // 9. get_context
  {
  name: 'get_context',
  description: 'Read saved context. Use key="builder", "validator", or "checker".',
  parameters: z.object({
    key: z.string().default('builder'),
  }),
  execute: async ({ key }) => {
    const sb = await getSb();
    try {
      return await sb.files.read(`/app/.build-context-${key}.json`);
    } catch {
      try { return await sb.files.read('/app/.build-context.json'); } catch {
        return JSON.stringify({});
      }
    }
  },
},
    // 10. save_context
  {
  name: 'save_context',
  description: 'Persist build context. Use key="builder", "validator", or "checker" to avoid overwrites.',
  parameters: z.object({
    context: z.string().describe('JSON string of the context object to save'),
    key: z.string().default('builder'),
  }),
  execute: async ({ context, key }) => {
    const sb   = await getSb();
    const file = `/app/.build-context-${key}.json`;
    const data = typeof context === 'string' ? context : JSON.stringify(context, null, 2);
    await sb.files.write(file, data);
    return JSON.stringify({ success: true, file });
  },
},

  ];
}