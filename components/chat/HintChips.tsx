"use client";
import React from "react";
import type { HintChip } from "@/types";

const HINTS: HintChip[] = [
  { label: "SaaS Landing",  prompt: "Build a SaaS landing page with hero, features, pricing, and CTA sections" },
  { label: "Todo App",      prompt: "Build a full-featured todo app with categories, priorities, and local state" },
  { label: "Portfolio",     prompt: "Build a developer portfolio with projects, skills, and contact section" },
  { label: "Dashboard",     prompt: "Build an analytics dashboard with charts, KPI cards, and a data table" },
];

export function HintChips({ onSelect }: { onSelect: (prompt: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 px-3 pb-2">
      {HINTS.map((h) => (
        <button
          key={h.label}
          onClick={() => onSelect(h.prompt)}
          className="text-[11px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:border-violet-500/50 hover:text-violet-400 transition-colors"
        >
          {h.label}
        </button>
      ))}
    </div>
  );
}