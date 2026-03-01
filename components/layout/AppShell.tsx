"use client";
import React from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { CenterPanel } from "@/components/preview/CenterPanel";

export function AppShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar />
      <CenterPanel />
      <ChatPanel />
    </div>
  );
}