"use client";
import React from "react";
import { Monitor, Code2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { CodeViewer } from "./CodeViewer";
import { PreviewFrame } from "./PreviewFrame";
import { ProgressBar } from "./ProgressBar";

export function CenterPanel() {
  const { activeTab, setActiveTab, previewUrl } = useAppStore();

  return (
    <main className="flex-1 flex flex-col overflow-hidden border-x border-border">
      <ProgressBar />

      {/* Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card shrink-0">
        <Button
        // @ts-ignore
          variant={activeTab === "preview" ? "secondary" : "ghost"}
          size="sm"
          className="gap-1.5 h-7 text-xs"
          onClick={() => setActiveTab("preview")}
        >
          <Monitor className="w-3.5 h-3.5" />
          Preview
        </Button>
        <Button
        // @ts-ignore
          variant={activeTab === "code" ? "secondary" : "ghost"}
          size="sm"
          className="gap-1.5 h-7 text-xs"
          onClick={() => setActiveTab("code")}
        >
          <Code2 className="w-3.5 h-3.5" />
          Code
        </Button>
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-violet-400 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {previewUrl.replace(/^https?:\/\//, "").slice(0, 40)}
          </a>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "preview" ? <PreviewFrame /> : <CodeViewer />}
      </div>
    </main>
  );
}