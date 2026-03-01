"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Coins } from "lucide-react";
import { formatCost } from "@/lib/utils";
import type { TokenSummary } from "@/types";

export function TokenStats({ tokens }: { tokens: TokenSummary }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-muted/30 text-xs overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors"
      >
        <Coins className="w-3.5 h-3.5 text-yellow-400" />
        <span className="font-medium text-foreground">
          {formatCost(tokens.total.cost_usd)} · {(tokens.total.input + tokens.total.output).toLocaleString()} tokens
        </span>
        <span className="ml-auto text-muted-foreground">
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1 border-t border-border pt-2">
          {Object.entries(tokens.agents).map(([name, a]) => (
            <div key={name} className="flex justify-between text-muted-foreground">
              <span className="truncate mr-2">{name}</span>
              <span className="shrink-0">{(a.input + a.output).toLocaleString()} · {formatCost(a.cost_usd)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}