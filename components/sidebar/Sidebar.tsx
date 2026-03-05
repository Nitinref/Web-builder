"use client";
import React, { useState } from "react";
import { Plus, Trash2, Loader2, Zap, LogOut, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjects, useProjectFiles } from "@/hooks/useProjects";
import { useAppStore } from "@/store/appStore";
import { useAuth } from "@/hooks/useAuth";
import { NewProjectDialog } from "./NewProjectDialog";
import { getFileIcon, hashColor, cn } from "@/lib/utils";
import type { ProjectFile } from "@/types";

function ForgeLogo() {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/30">
        <Zap className="w-4 h-4 text-white" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-display text-lg font-black whitespace-nowrap bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent"
      >
        FORGE
      </motion.span>
    </div>
  );
}

function ForgeLogoIcon() {
  return (
    <div className="flex items-center justify-center py-1">
      <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
        <Zap className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}

export default function ForgeSidebar() {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { projects, isLoading, deleteMutation } = useProjects();
  const { activeProject, setActiveProject, setSelectedFile, setActiveTab } = useAppStore();
  const { data: files = [] } = useProjectFiles(activeProject?.id ?? null);
  const { logout, user } = useAuth();

  function handleFileClick(file: ProjectFile) {
    setSelectedFile(file);
    setActiveTab("code");
  }

  return (
    <>
      <Sidebar open={open} setOpen={setOpen}>
        {/* 
          IMPORTANT: Pass className directly — DesktopSidebar applies it.
          Remove padding from here (px-4 py-4 comes from DesktopSidebar default,
          we override via className on SidebarBody which passes to DesktopSidebar)
        */}
        <SidebarBody className="justify-between gap-0 !px-0 !py-0 border-r border-border bg-card"
          style={{
            backgroundImage: `radial-gradient(circle, hsl(240 5% 30% / 0.2) 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
          }}
        >
          <div className="flex flex-col h-full overflow-hidden">

            {/* Logo */}
            <div className="px-3 py-4 border-b border-border shrink-0">
              {open ? <ForgeLogo /> : <ForgeLogoIcon />}
            </div>

            {/* New Project */}
            <div className="px-3 py-3 border-b border-border shrink-0">
              {open ? (
                <button
                  onClick={() => setDialogOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                             bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold
                             shadow-md shadow-violet-500/25 transition-colors duration-150"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Project
                </button>
              ) : (
                <button
                  onClick={() => setDialogOpen(true)}
                  className="w-full flex items-center justify-center p-2 rounded-lg
                             bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30
                             text-violet-400 transition-all duration-150"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Projects + Files — scrollable middle */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
              {open && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2 mt-1">
                  Projects
                </p>
              )}

              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : projects.length === 0 && open ? (
                <div className="px-2 py-6 text-center">
                  <FolderOpen className="w-5 h-5 mx-auto mb-2 text-muted-foreground opacity-40" />
                  <p className="text-[11px] text-muted-foreground opacity-60">No projects yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {projects.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      onClick={() => setActiveProject(p)}
                      className={cn(
                        "group relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer",
                        "transition-colors duration-150 select-none border",
                        activeProject?.id === p.id
                          ? "bg-violet-500/15 border-violet-500/30 text-white"
                          : "hover:bg-white/5 border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {activeProject?.id === p.id && (
                        <motion.span
                          layoutId="activeBar"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-violet-400"
                        />
                      )}
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: hashColor(p.id) }}
                      />
                      {open && (
                        <>
                          <span className="flex-1 text-xs font-medium truncate">{p.name}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(p.id); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-muted-foreground hover:text-destructive transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Files */}
              <AnimatePresence>
                {activeProject && files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-t border-border pt-2 mt-3"
                  >
                    {open && (
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-1.5">
                        Files
                      </p>
                    )}
                    {files.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => handleFileClick(f)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md
                                   text-xs text-muted-foreground hover:text-foreground
                                   hover:bg-white/5 transition-colors duration-150 text-left"
                      >
                        <span className="text-sm shrink-0">{getFileIcon(f.path)}</span>
                        {open && <span className="truncate">{f.path.split("/").pop()}</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border px-3 py-3 shrink-0 flex flex-col gap-1">
              <SidebarLink
                link={{
                  label: user?.name ?? user?.email ?? "User",
                  href: "#",
                  icon: (
                    <div className="w-7 h-7 rounded-full bg-violet-500/20 border border-violet-500/30
                                    flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
                      {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  ),
                }}
              />
              <SidebarLink
                link={{
                  label: "Sign out",
                  href: "#",
                  icon: <LogOut className="w-5 h-5 shrink-0 text-muted-foreground" />,
                }}
                // @ts-ignore
                onClick={logout}
              />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      <NewProjectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}