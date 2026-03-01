"use client";
import React from "react";
import { Zap } from "lucide-react";
import { useAppStore } from "@/store/appStore";

export function PreviewFrame() {
  const { previewUrl, isBuilding } = useAppStore();

  if (!previewUrl) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
          <Zap className="w-8 h-8 text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            {isBuilding ? "Building your app…" : "Ready to build"}
          </p>
          <p className="text-xs text-muted-foreground">
            {isBuilding
              ? "Preview will appear here once the build completes"
              : "Select a project and describe what you want to build"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={previewUrl}
      className="w-full h-full border-none bg-white"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      title="App Preview"
    />
  );
}