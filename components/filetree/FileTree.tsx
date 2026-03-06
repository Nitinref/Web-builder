"use client";
import React, { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useProjectFiles } from "@/hooks/useProjects";
import { getFileIcon } from "@/components/ui/getFileIcon";
import { cn } from "@/lib/utils";
import type { ProjectFile } from "@/types";

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children: TreeNode[];
  file?: ProjectFile;
}

function buildTree(files: ProjectFile[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();

  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));

  sorted.forEach(file => {
    const parts = file.path.replace(/^\//, "").split("/");
    let current = root;

    parts.forEach((part, i) => {
      const fullPath = parts.slice(0, i + 1).join("/");
      if (!map.has(fullPath)) {
        const node: TreeNode = {
          name: part,
          path: fullPath,
          type: i === parts.length - 1 ? "file" : "dir",
          children: [],
          file: i === parts.length - 1 ? file : undefined,
        };
        map.set(fullPath, node);
        current.push(node);
      }
      current = map.get(fullPath)!.children;
    });
  });

  return root;
}

function TreeItem({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const { selectedFile, setSelectedFile, setActiveTab } = useAppStore();
  const isSelected = node.file && selectedFile?.path === node.file.path;

  if (node.type === "dir") {
    return (
      <div>
        <button
          onClick={() => setOpen(v => !v)}
          className={cn(
            "w-full flex items-center gap-1.5 px-3 py-1.5 text-left transition-all duration-200",
            "hover:bg-white/[0.03] group"
          )}
          style={{ paddingLeft: `${12 + depth * 14}px` }}
        >
          <span className="text-white/30 group-hover:text-white/50 transition-colors">
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
          <span className="text-white/40 group-hover:text-white/60 transition-colors">
            {open ? <FolderOpen size={14} /> : <Folder size={14} />}
          </span>
          <span className="font-mono text-xs text-white/50 group-hover:text-white/70 truncate transition-colors">
            {node.name}
          </span>
        </button>
        {open && node.children.map(child => (
          <TreeItem key={child.path} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        if (node.file) { setSelectedFile(node.file); setActiveTab("code"); }
      }}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-1.5 text-left transition-all duration-200",
        "font-mono text-xs border-l-2",
        isSelected 
          ? "bg-white/[0.08] border-l-white text-white" 
          : "border-l-transparent text-white/40 hover:bg-white/[0.03] hover:text-white/70 hover:border-l-white/30"
      )}
      style={{ paddingLeft: `${12 + depth * 14}px` }}
    >
      <span className="text-[15px] leading-none">{getFileIcon(node.name)}</span>
      <span className="truncate">{node.name}</span>
    </button>
  );
}

export function FileTree() {
  const { activeProject } = useAppStore();
  const { data: files = [], isLoading } = useProjectFiles(activeProject?.id ?? null);

  // Loading state with premium skeleton
  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {[85, 65, 75, 55, 70, 45, 60].map((width, i) => (
          <div 
            key={i}
            className="h-3 rounded-sm bg-gradient-to-r from-white/[0.03] via-white/[0.06] to-white/[0.03] animate-pulse"
            style={{ width: `${width}%` }}
          />
        ))}
        <div className="pt-2 mt-2 border-t border-white/[0.05] space-y-2">
          {[65, 45, 55].map((width, i) => (
            <div 
              key={`sub-${i}`}
              className="h-3 rounded-sm bg-gradient-to-r from-white/[0.02] via-white/[0.04] to-white/[0.02] animate-pulse"
              style={{ width: `${width}%`, marginLeft: '20px' }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!activeProject || files.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-sm bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
          <File size={16} className="text-white/20" />
        </div>
        <p className="font-mono text-xs text-white/30">No files yet</p>
        <p className="font-mono text-[10px] text-white/20 mt-1">Build something to see your project</p>
      </div>
    );
  }

  const tree = buildTree(files);

  return (
    <div className="py-2 select-none">
      {/* Header */}
      <div className="px-3 py-2 mb-1 border-b border-white/[0.05]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">
          Explorer • {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
      </div>
      
      {/* Tree */}
      <div>
        {tree.map(node => <TreeItem key={node.path} node={node} />)}
      </div>
    </div>
  );
}