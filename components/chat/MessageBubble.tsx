"use client";
import React from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "rounded-xl px-3 py-2 text-xs max-w-[85%] leading-relaxed",
          isUser
            ? "bg-gray-800 text-white rounded-br-sm"
            : "bg-gray-100 border border-gray-300 rounded-bl-sm text-gray-900"
        )}
      >
        {message.content}
        {message.metadata?.previewUrl && (
          <a
            href={message.metadata.previewUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 mt-2 text-gray-600 hover:text-gray-900 transition-colors text-[11px]"
          >
            <ExternalLink className="w-3 h-3" />
            Open Preview
          </a>
        )}
      </div>
    </div>
  );
}