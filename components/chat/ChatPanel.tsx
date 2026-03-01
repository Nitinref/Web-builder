"use client";

import React, { useRef, useEffect, useState, KeyboardEvent } from "react";
import { Send, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/appStore";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { StageCard } from "./StageCard";
import { HintChips } from "./HintChips";
import { TokenStats } from "./TokenStats";
import type { PipelineEvent } from "@/types";

export function ChatPanel() {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    activeProject,
    activeChatId,
    isBuilding,
    pipelineEvents,
    buildProgress,
  } = useAppStore();

  const { messagesQuery, sendMutation } = useChat(activeChatId);
  const messages = messagesQuery.data ?? [];

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pipelineEvents]);

  // Auto resize textarea
  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || isBuilding || !activeProject) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    sendMutation.mutate(text);
  }

  const telemetry = pipelineEvents.findLast(
    (e: PipelineEvent) => e.type === "telemetry"
  );

  return (
    <aside className="w-[360px] shrink-0 flex flex-col bg-gradient-to-b from-card to-muted/30 border-l border-border overflow-hidden">

      {/* ================= HEADER ================= */}
      <div className="px-5 py-4 border-b border-border shrink-0 backdrop-blur-md bg-background/60">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wide">Build Chat</h2>

          <div className="flex items-center gap-2 text-xs">
            {activeChatId ? (
              <div className="flex items-center gap-1.5 text-green-400">
                <Wifi className="w-3.5 h-3.5" />
                <span>Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Idle</span>
              </div>
            )}
          </div>
        </div>

        {/* Build Progress */}
        {isBuilding && (
          <div className="mt-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-cyan-500 to-blue-500 transition-all duration-700 ease-out rounded-full"
                style={{ width: `${buildProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 text-right">
              {buildProgress}% Building...
            </p>
          </div>
        )}
      </div>

      {/* ================= MESSAGES ================= */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="flex flex-col gap-3">

          {!activeProject && (
            <div className="text-xs text-muted-foreground text-center py-6">
              Select or create a project to start building
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {pipelineEvents
            .filter(
              (e): e is PipelineEvent & {
                stage: NonNullable<PipelineEvent["stage"]>;
              } => e.type === "pipeline_update" && !!e.stage
            )
            .map((e, i) => (
              <StageCard key={i} event={e} />
            ))}

          {telemetry?.tokens && <TokenStats tokens={telemetry.tokens} />}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* ================= HINT CHIPS ================= */}
      {!isBuilding && messages.length === 0 && activeProject && (
        <HintChips
          onSelect={(prompt) => {
            setInput(prompt);
            textareaRef.current?.focus();
          }}
        />
      )}

      {/* ================= INPUT ================= */}
      <div className="p-4 border-t border-border bg-gradient-to-b from-background to-muted/20 backdrop-blur-md shrink-0">

        <div className="relative group">

          {/* Glow Effect */}
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-violet-500/40 via-cyan-500/30 to-blue-500/40 opacity-0 group-focus-within:opacity-100 blur-md transition-all duration-500" />

          {/* Input Box */}
          <div className="relative flex gap-3 items-end bg-background/70 backdrop-blur-md border border-border rounded-xl px-4 py-3 transition-all duration-300 group-focus-within:border-violet-500/40 shadow-sm group-focus-within:shadow-lg">

            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                activeProject
                  ? "Describe what you want to build…"
                  : "Select a project first"
              }
              disabled={!activeProject || isBuilding}
              rows={1}
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground resize-none focus:outline-none max-h-[140px] disabled:opacity-50 leading-relaxed"
            />

            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isBuilding || !activeProject}
              className="w-10 h-10 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:scale-100"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-right mt-2">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </aside>
  );
}