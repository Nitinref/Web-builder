"use client";
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Loader2, LogOut, FolderOpen, Zap, Menu, X } from "lucide-react"; // Added Menu, X
import { cn, hashColor } from "@/lib/utils";
import { useProjects, useProjectFiles } from "@/hooks/useProjects";
import { useAppStore } from "@/store/appStore";
import { useAuth } from "@/hooks/useAuth";
import { NewProjectDialog } from "@/components/sidebar/NewProjectDialog";
import { ModelSelector } from "@/components/sidebar/ModelSelector";
import type { ProjectFile } from "@/types";

export const Logo = () => (
  <div className="relative z-20 flex items-center gap-2.5 py-1">
    <div className="w-7 h-7 rounded-sm bg-white flex items-center justify-center shrink-0 shadow-lg shadow-white/10">
      <Zap className="w-4 h-4 text-black" />
    </div>
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-lg font-black tracking-widest uppercase whitespace-nowrap text-white"
    >
      SEEZER
    </motion.span>
  </div>
);

export const LogoIcon = () => (
  <div className="relative z-20 flex items-center justify-center py-1">
    <div className="w-7 h-7 rounded-sm bg-white flex items-center justify-center shrink-0 shadow-lg shadow-white/10">
      <Zap className="w-4 h-4 text-black" />
    </div>
  </div>
);

export default function ForgeSidebar() {
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false); // Add mobile state
  const [dialogOpen, setDialogOpen] = useState(false);
  const { projects, isLoading, deleteMutation } = useProjects();
  const { activeProject, setActiveProject, setSelectedFile, setActiveTab } = useAppStore();
  const { data: files = [] } = useProjectFiles(activeProject?.id ?? null);
  const { logout, user } = useAuth();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function handleFileClick(file: ProjectFile) {
    setSelectedFile(file);
    setActiveTab("code");
  }

  // Close mobile sidebar when project is selected
  const handleProjectSelect = (project: any) => {
    setActiveProject(project);
    if (window.innerWidth < 768) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-[70] md:hidden w-10 h-10 rounded-sm bg-[#0f0f0f] border border-white/10 flex items-center justify-center text-white/70"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - mobile responsive */}
      <motion.div
        initial={false}
        animate={{
          x: mobileOpen ? 0 : (window.innerWidth < 768 ? -300 : 0),
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className={cn(
          "fixed md:relative z-[65] h-screen bg-[#0a0a0a] border-r border-white/[0.07]",
          "w-[280px] shrink-0", // Fixed width
          mobileOpen ? "left-0" : "left-[-300px] md:left-0"
        )}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 bg-[#0a0a0a] border-r border-white/[0.07] h-full overflow-y-auto">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo /> : <LogoIcon />}

              {/* New Project button */}
              <div className="mt-6 mb-3">
                <button
                  onClick={() => {
                    setDialogOpen(true);
                    if (window.innerWidth < 768) setMobileOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-2 w-full rounded-sm border border-white/20 bg-white/[0.06] text-white font-mono text-[11px] font-medium tracking-widest uppercase transition-all duration-150 hover:bg-white/10 hover:border-white/35",
                    open ? "px-3 py-2 justify-start" : "p-2 justify-center"
                  )}
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  {open && <span>New Project</span>}
                </button>
              </div>

              {/* Projects label */}
              {open && (
                <p className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase text-white/25 px-1 mb-1.5">
                  Projects
                </p>
              )}

              {/* Project list */}
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-white/25" />
                </div>
              ) : projects.length === 0 && open ? (
                <div className="py-4 text-center">
                  <FolderOpen className="w-5 h-5 mx-auto mb-1 text-white/20" />
                  <p className="font-mono text-[11px] text-white/25">No projects yet</p>
                </div>
              ) : (
                <div className="flex flex-col gap-0.5">
                  {projects.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      onClick={() => handleProjectSelect(p)}
                      className={cn(
                        "group relative flex items-center gap-2 rounded-sm cursor-pointer select-none transition-all duration-150 border-l-2",
                        open ? "px-2 py-[7px] justify-start" : "px-1 py-[7px] justify-center",
                        activeProject?.id === p.id
                          ? "bg-white/[0.08] border-white/50 text-white"
                          : "border-transparent text-white/40 hover:bg-white/[0.04] hover:text-white/70"
                      )}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: hashColor(p.id) }}
                      />
                      {open && (
                        <>
                          <span className="flex-1 font-mono text-[12px] font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                            {p.name}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(p.id); }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all shrink-0 text-white/25 hover:text-white/80"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom section */}
            <div className="flex flex-col gap-2">
              {open && (
                <div className="px-0.5">
                  <ModelSelector />
                </div>
              )}

              <div className="h-px bg-white/[0.07] my-0.5" />

              {/* User */}
              <SidebarLink
                link={{
                  label: user?.name ?? user?.email ?? "User",
                  href: "#",
                  icon: (
                    <div className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/20 flex items-center justify-center font-mono text-[12px] font-bold text-white shrink-0">
                      {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  ),
                }}
              />
              {/* @ts-ignore */}
              <SidebarLink
                link={{
                  label: "Sign out",
                  href: "#",
                  icon: <LogOut className="w-5 h-5 shrink-0 text-white/30" />,
                }}
                // @ts-ignore
                onClick={logout}
              />
            </div>
          </SidebarBody>
        </Sidebar>
      </motion.div>

      <NewProjectDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}