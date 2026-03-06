"use client";
import React, { useState } from "react";
import { Monitor, Code2, ExternalLink, Copy, Check, Zap, ChevronDown, Link2 } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { CodeViewer } from "./CodeViewer";
import { cn } from "@/lib/utils";

export function CenterPanel() {
  const { activeTab, setActiveTab, previewUrl, isBuilding, buildProgress, pipelineEvents } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [showUrlBar, setShowUrlBar] = useState(false);

  const STAGE_LABELS: Record<string, string> = {
    start: "Initializing…", sandbox: "Spinning up sandbox…",
    planning: "Planning architecture…", building: "Writing code…",
    validating: "Validating files…", checking: "Running build check…",
    done: "Build complete!", error: "Build failed",
  };

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
    <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] border-l border-r border-white/[0.07] max-w-full">
      
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

      {/* MOBILE-OPTIMIZED HEADER */}
      <div className="border-b border-white/[0.07] bg-[#0f0f0f]">
        {/* Row 1: Tabs + Status */}
        <div className="flex items-center justify-between px-2 py-1.5">
          {/* Tabs */}
          <div className="flex gap-0.5 bg-white/[0.04] rounded-sm p-0.5">
            {[
              { id: "preview", icon: <Monitor size={14} />, label: "Preview" },
              { id: "code", icon: <Code2 size={14} />, label: "Code" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "preview" | "code")}
                className={cn(
                  "flex items-center gap-1 px-2 py-1.5 rounded-sm font-mono text-[10px] font-medium tracking-wide uppercase transition-all duration-150",
                  activeTab === tab.id
                    ? "bg-white/[0.08] text-white shadow-sm"
                    : "text-white/25 hover:text-white/55"
                )}
              >
                {tab.icon}
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Status - compact */}
          {(isBuilding || (!isBuilding && buildProgress === 100)) && (
            <div className="flex items-center gap-1 px-1.5 py-1 rounded-sm border border-white/10 bg-white/[0.03] font-mono text-[8px] text-white/45 max-w-[90px]">
              {isBuilding && stageLabel && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/50 shrink-0 animate-pulse" />
                  <span className="truncate">{stageLabel === "Writing code…" ? "Building" : stageLabel}</span>
                </>
              )}
              {!isBuilding && buildProgress === 100 && (
                <>
                  <Zap size={8} className="shrink-0" />
                  <span className="truncate">Ready</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Row 2: URL Toggle + Actions */}
        {previewUrl && (
          <div className="px-2 pb-1.5">
            {/* Toggle button */}
            <button
              onClick={() => setShowUrlBar(!showUrlBar)}
              className="flex items-center justify-between w-full px-2 py-1.5 rounded-sm bg-white/[0.02] border border-white/[0.05] text-left"
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Link2 size={12} className="text-white/30 shrink-0" />
                <span className="font-mono text-[9px] text-white/30 truncate">
                  {previewUrl.replace(/^https?:\/\//, "")}
                </span>
              </div>
              <ChevronDown 
                size={12} 
                className={cn(
                  "text-white/30 transition-transform duration-200 shrink-0 ml-1",
                  showUrlBar && "rotate-180"
                )} 
              />
            </button>

            {/* Expanded actions */}
            {showUrlBar && (
              <div className="flex items-center gap-1 mt-1.5">
                <div className="flex-1 px-2 py-1.5 rounded-sm bg-white/[0.04] border border-white/[0.07] font-mono text-[8px] text-white/30 truncate">
                  {previewUrl.replace(/^https?:\/\//, "")}
                </div>
                <button
                  onClick={handleCopyUrl}
                  className={cn(
                    "w-6 h-6 rounded-sm flex items-center justify-center transition-all duration-150 shrink-0",
                    copied
                      ? "bg-white/10 text-white/80"
                      : "bg-white/[0.04] text-white/30 hover:bg-white/[0.08] hover:text-white/70"
                  )}
                >
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                </button>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-6 h-6 rounded-sm bg-white/[0.04] border border-white/[0.07] text-white/30 flex items-center justify-center transition-all duration-150 hover:bg-white/[0.08] hover:text-white/70 shrink-0"
                >
                  <ExternalLink size={10} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-hidden relative">
        {/* Code viewer */}
        {activeTab === "code" && (
          <div className="absolute inset-0 overflow-auto">
            <CodeViewer />
          </div>
        )}

        {/* Preview iframe */}
        {previewUrl && (
          <iframe
            src={previewUrl}
            className="absolute inset-0 w-full h-full border-0"
            title="Preview"
            style={{ display: activeTab === "preview" ? "block" : "none" }}
          />
        )}

        {/* Empty state */}
        {activeTab === "preview" && !previewUrl && !isBuilding && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4">
            <div className="w-12 h-12 rounded-sm bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <Monitor size={20} className="text-white/20" />
            </div>
            <div className="text-center">
              <p className="font-mono text-xs text-white/35">Preview will appear here</p>
              <p className="font-mono text-[10px] text-white/20 mt-0.5">Send a message to start building</p>
            </div>
          </div>
        )}

        {/* Building overlay */}
        {isBuilding && activeTab === "preview" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a0a0a]/90 backdrop-blur-sm z-10 px-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
              <div className="absolute inset-2 rounded-full bg-white/[0.04] flex items-center justify-center">
                <Zap size={14} className="text-white/40" />
              </div>
            </div>
            <div className="text-center">
              <p className="font-mono text-xs font-semibold text-white/75">
                {stageLabel ?? "Building…"}
              </p>
              <p className="font-mono text-[9px] text-white/30 mt-0.5">
                {buildProgress}%
              </p>
            </div>
            <div className="w-32 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
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