"use client";
import React, { useState } from "react";
import { Plus, Trash2, FolderOpen, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjects, useProjectFiles } from "@/hooks/useProjects";
import { useAppStore } from "@/store/appStore";
import { NewProjectDialog } from "./NewProjectDialog";
import { getFileIcon, hashColor } from "@/lib/utils";
import type { ProjectFile } from "@/types";

export function Sidebar() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { projects, isLoading, deleteMutation } = useProjects();
  const { activeProject, setActiveProject, setSelectedFile, setActiveTab } = useAppStore();
  const { data: files = [] } = useProjectFiles(activeProject?.id ?? null);

  function handleFileClick(file: ProjectFile) {
    setSelectedFile(file);
    setActiveTab("code");
  }

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-card border-r border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <span className="block font-display text-xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-3">
          FORGE
        </span>
        <Button className="w-full gap-2 text-sm" onClick={() => setDialogOpen(true)}>
          <Plus className="w-3.5 h-3.5" />
          New Project
        </Button>
      </div>

      {/* Project list */}
      <div className="px-2 pt-3 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1">
          Projects
        </p>
      </div>
      <ScrollArea className="flex-1 px-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-4">No projects yet</p>
        ) : (
          <div className="flex flex-col gap-0.5 pb-2">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => setActiveProject(p)}
                className={`group flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors ${
                  activeProject?.id === p.id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: hashColor(p.id) }}
                />
                <span className="flex-1 text-xs truncate font-medium">{p.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(p.id); }}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* File tree */}
        {activeProject && files.length > 0 && (
          <div className="border-t border-border pt-2 mt-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1">
              Files
            </p>
            {files.map((f) => (
              <button
                key={f.id}
                onClick={() => handleFileClick(f)}
                className="w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors text-left"
              >
                <span className="text-xs">{getFileIcon(f.path)}</span>
                <span className="truncate">{f.path.split("/").pop()}</span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      <NewProjectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </aside>
  );
}