"use client";
import React from "react";
import ForgeSidebarDemo from "@/components/sidebar-demo"; // ✅ Aceternity generated file
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CenterPanel } from "@/components/preview/CenterPanel";

export function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <ForgeSidebarDemo />
      <div className="flex flex-1 min-w-0 overflow-hidden">
        <CenterPanel />
        <ChatPanel />
      </div>
    </div>
  );
}