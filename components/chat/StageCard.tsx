"use client";
import React from "react";
import { cn } from "@/lib/utils";
import type { PipelineEvent, PipelineStage } from "@/types";

const STAGE_CONFIG: Record<PipelineStage, { icon: string; color: string; bg: string; border: string }> = {
    start: { icon: "▶", color: "text-foreground", bg: "", border: "border-border" },
    sandbox: { icon: "📦", color: "text-cyan-400", bg: "bg-cyan-500/5", border: "border-cyan-500/20" },
    planning: { icon: "🧠", color: "text-violet-400", bg: "bg-violet-500/5", border: "border-violet-500/20" },
    building: { icon: "⚙️", color: "text-yellow-400", bg: "bg-yellow-500/5", border: "border-yellow-500/20" },
    validating: { icon: "🔍", color: "text-orange-400", bg: "bg-orange-500/5", border: "border-orange-500/20" },
    checking: { icon: "✅", color: "text-cyan-400", bg: "bg-cyan-500/5", border: "border-cyan-500/20" },
    done: { icon: "🚀", color: "text-green-400", bg: "bg-green-500/5", border: "border-green-500/20" },
    error: { icon: "❌", color: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/20" },
    preview: {
        icon: "",
        color: "",
        bg: "",
        border: ""
    }
};

interface Props {
  event: PipelineEvent & { stage: PipelineStage };
}

export function StageCard({ event }: Props) {
  const cfg = STAGE_CONFIG[event.stage] ?? STAGE_CONFIG.start;

  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg border p-2.5 animate-fade-in text-xs", cfg.bg, cfg.border)}>
      <span className="text-sm shrink-0 mt-0.5">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <p className={cn("text-[10px] font-bold uppercase tracking-wide mb-0.5", cfg.color)}>
          {event.stage}
        </p>
        <p className="text-muted-foreground leading-relaxed break-words">{event.message}</p>
        {event.previewUrl && (
          <a
            href={event.previewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 mt-1.5 text-green-400 hover:text-green-300 transition-colors text-[11px]"
          >
            🔗 Open Preview
          </a>
        )}
        {event.replans !== undefined && event.replans > 0 && (
          <p className="text-[10px] text-yellow-400 mt-1">⚠️ Replanned {event.replans}×</p>
        )}
      </div>
    </div>
  );
}