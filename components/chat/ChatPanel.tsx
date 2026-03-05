"use client";
import React, { useRef, useEffect, useState, KeyboardEvent } from "react";
import { Send, Paperclip, Plus, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query"; // ✅ added
import { useAppStore } from "@/store/appStore";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { StageCard } from "./StageCard";
import { HintChips } from "./HintChips";
import { TokenStats } from "./TokenStats";
import { cn } from "@/lib/utils";
import type { PipelineEvent } from "@/types";

export function ChatPanel() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);

  const qc = useQueryClient(); // ✅ added

  const { activeProject, activeChatId, isBuilding, pipelineEvents, buildProgress } = useAppStore();
  const { messagesQuery, sendMutation } = useChat(activeChatId);
  const messages = messagesQuery.data ?? [];

  // ✅ KEY FIX: whenever a new "message" event arrives over WebSocket
  // (stored in pipelineEvents by appStore), invalidate the messages query
  // so React Query refetches and the new message appears immediately.
  useEffect(() => {
    const lastEvent = pipelineEvents[pipelineEvents.length - 1];
    if (!lastEvent) return;

    // "telemetry" is the final event in the pipeline — safe to refetch messages
    // Valid types per PipelineEvent: "pipeline_update" | "telemetry" | "connected" | "pong"
    if (lastEvent.type === "telemetry") {
      qc.invalidateQueries({ queryKey: ["messages", activeChatId] });
    }
  }, [pipelineEvents, activeChatId, qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pipelineEvents]);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || isBuilding || !activeProject) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    sendMutation.mutate(text);
  }

  const telemetry = pipelineEvents.findLast((e: PipelineEvent) => e.type === "telemetry");
  const canSend = !!input.trim() && !!activeProject && !isBuilding;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">

      {/* Progress bar */}
      {isBuilding && (
        <div className="h-0.5 shrink-0 bg-white/[0.04] overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-700 ease-in-out"
            style={{
              width: `${buildProgress}%`,
              boxShadow: "0 0 8px rgba(255,255,255,0.35)",
            }}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">

        {!activeProject && (
          <div className="flex-1 flex items-center justify-center font-mono text-[12px] text-white/20">
            Select or create a project to start building
          </div>
        )}

        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}

        {pipelineEvents
          .filter((e): e is PipelineEvent & { stage: NonNullable<PipelineEvent["stage"]> } =>
            e.type === "pipeline_update" && !!e.stage)
          .map((e, i) => <StageCard key={i} event={e} />)}

        {telemetry?.tokens && <TokenStats tokens={telemetry.tokens} />}

        <div ref={bottomRef} />
      </div>

      {/* Hint chips */}
      {!isBuilding && messages.length === 0 && activeProject && (
        <HintChips onSelect={p => { setInput(p); textareaRef.current?.focus(); }} />
      )}

      {/* Input area */}
      <div className="px-5 pb-4 pt-3 shrink-0 border-t border-white/[0.06]">
        <div className="bg-white/[0.04] border border-white/10 rounded-sm px-3.5 py-3 flex items-end gap-2.5">

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={activeProject ? "Type your message..." : "Select a project first"}
            disabled={!activeProject || isBuilding}
            rows={1}
            className={cn(
              "flex-1 bg-transparent border-none outline-none resize-none font-mono text-[13px] leading-relaxed text-white/85 placeholder:text-white/20 max-h-[160px] transition-opacity",
              (!activeProject || isBuilding) && "opacity-40"
            )}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button className="w-7 h-7 rounded-sm flex items-center justify-center text-white/20 hover:text-white/50 transition-colors">
              <Plus size={15} />
            </button>
            <button className="w-7 h-7 rounded-sm flex items-center justify-center text-white/20 hover:text-white/50 transition-colors">
              <Paperclip size={14} />
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "w-8 h-8 rounded-sm flex items-center justify-center transition-all duration-150",
                canSend
                  ? "bg-white text-black hover:bg-white/90 hover:scale-105"
                  : "bg-white/[0.06] text-white/20 cursor-not-allowed"
              )}
            >
              {isBuilding
                ? <RotateCcw size={13} className="animate-spin" />
                : <Send size={13} />}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}