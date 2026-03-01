"use client";
import React from "react";
import { FileCode } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/appStore";
import { useFileContent } from "@/hooks/useProjects";

export function CodeViewer() {
  const { activeProject, selectedFile } = useAppStore();
  const { data: fileData, isLoading } = useFileContent(
    activeProject?.id ?? null,
    selectedFile?.path ?? null
  );

  if (!selectedFile) {
    return (
      <div className="h-full flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <FileCode className="w-4 h-4" />
        Select a file from the sidebar
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <FileCode className="w-3.5 h-3.5" />
          <span className="font-mono">{selectedFile.path}</span>
        </div>
        <pre className="font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap break-all">
          {fileData?.content ?? "(empty file)"}
        </pre>
      </div>
    </ScrollArea>
  );
}