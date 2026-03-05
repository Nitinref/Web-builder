"use client";
import React, { useState } from "react";
import { Monitor, Code2, ExternalLink, Copy, Check, Zap } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { CodeViewer } from "./CodeViewer";
import { ProgressBar } from "./ProgressBar";
import { cn } from "@/lib/utils";

export function CenterPanel() {
  const { activeTab, setActiveTab, previewUrl, isBuilding, buildProgress, pipelineEvents } = useAppStore();
  const [copied, setCopied] = useState(false);

  const STAGE_LABELS: Record<string, string> = {
    start: "Initializing…", sandbox: "Spinning up sandbox…",
    planning: "Planning architecture…", building: "Writing code…",
    validating: "Validating files…", checking: "Running build check…",
    done: "Build complete!", error: "Build failed",
  };

  // Get latest stage from pipeline events
  const lastEvent = pipelineEvents.findLast(
    (e) => e.type === "pipeline_update" && !!e.stage
  );
  const currentStage = lastEvent?.stage ?? null;
  const stageLabel = currentStage ? (STAGE_LABELS[currentStage] ?? currentStage) : null;

  async function handleCopyUrl() {
    if (!previewUrl) return;
    await navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] border-l border-r border-white/[0.07]">

      {/* TOP PROGRESS LINE */}
      <div className="h-0.5 bg-white/[0.04] shrink-0 overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-700 ease-in-out"
          style={{
            width: `${buildProgress}%`,
            opacity: isBuilding || buildProgress > 0 ? 1 : 0,
            boxShadow: "0 0 8px rgba(255,255,255,0.35)",
          }}
        />
      </div>

      {/* TAB BAR */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.07] bg-[#0f0f0f] shrink-0 min-h-[46px] overflow-hidden">

        {/* Tabs */}
        <div className="flex gap-0.5 bg-white/[0.04] rounded-sm p-0.5 shrink-0">
          {[
            { id: "preview", icon: <Monitor size={13} />, label: "Preview" },
            { id: "code",    icon: <Code2 size={13} />,   label: "Code"    },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "preview" | "code")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-[11px] font-medium tracking-wide uppercase transition-all duration-150 whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-white/[0.08] text-white shadow-sm"
                  : "text-white/25 hover:text-white/55"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stage pill */}
        {isBuilding && stageLabel && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-white/10 bg-white/[0.03] font-mono text-[10px] text-white/45 shrink-0 max-w-[150px] overflow-hidden">
            <span className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0 animate-pulse" />
            <span className="truncate">{stageLabel}</span>
          </div>
        )}

        {/* Done badge */}
        {!isBuilding && buildProgress === 100 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-white/10 bg-white/[0.03] font-mono text-[10px] text-white/55 shrink-0">
            <Zap size={10} />
            <span>Ready</span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-w-0" />

        {/* Preview URL */}
        {previewUrl && (
          <div className="flex items-center gap-1.5 shrink-0 min-w-0 max-w-[260px]">
            <div className="px-2.5 py-1 rounded-sm bg-white/[0.04] border border-white/[0.07] font-mono text-[10px] text-white/30 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
              {previewUrl.replace(/^https?:\/\//, "")}
            </div>
            <button
              onClick={handleCopyUrl}
              title="Copy URL"
              className={cn(
                "w-7 h-7 rounded-sm flex items-center justify-center transition-all duration-150 shrink-0",
                copied
                  ? "bg-white/10 text-white/80"
                  : "bg-white/[0.04] text-white/30 hover:bg-white/[0.08] hover:text-white/70"
              )}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              title="Open in new tab"
              className="w-7 h-7 rounded-sm bg-white/[0.04] border border-white/[0.07] text-white/30 flex items-center justify-center transition-all duration-150 hover:bg-white/[0.08] hover:text-white/70 shrink-0"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        )}
      </div>

{/* CONTENT */}
<div className="flex-1 overflow-hidden relative">

  {/* Code viewer */}
  {activeTab === "code" && (
    <div className="absolute inset-0">
      <CodeViewer />
    </div>
  )}

  {/* Preview iframe — always mounted once URL exists, just hidden when on code tab */}
  {previewUrl && (
    <iframe
      src={previewUrl}
      className="absolute inset-0 w-full h-full border-0"
      title="Preview"
      style={{ display: activeTab === "preview" ? "block" : "none" }}
    />
  )}

  {/* Empty preview state */}
  {activeTab === "preview" && !previewUrl && !isBuilding && (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
      <div className="w-14 h-14 rounded-sm bg-white/[0.04] border border-white/10 flex items-center justify-center">
        <Monitor size={24} className="text-white/20" />
      </div>
      <div className="text-center">
        <p className="font-mono text-[13px] text-white/35 font-medium">Preview will appear here</p>
        <p className="font-mono text-[11px] text-white/20 mt-1">Send a message to start building</p>
      </div>
    </div>
  )}

  {/* Building overlay — sits ON TOP of iframe */}
  {isBuilding && activeTab === "preview" && (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]/90 backdrop-blur-sm z-10">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-white/[0.04] flex items-center justify-center">
          <Zap size={18} className="text-white/40" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-mono text-[13px] font-semibold text-white/75">
          {stageLabel ?? "Building…"}
        </p>
        <p className="font-mono text-[11px] text-white/30 mt-1">
          {buildProgress}% complete
        </p>
      </div>
      <div className="w-48 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full bg-white/55 rounded-full transition-all duration-700 ease-in-out"
          style={{ width: `${buildProgress}%` }}
        />
      </div>
    </div>
  )}

</div>
    </main>
  );
}