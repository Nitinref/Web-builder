"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, FolderPlus } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";

interface Props { open: boolean; onClose: () => void; }

export function NewProjectDialog({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const { createMutation } = useProjects();

  async function handleCreate() {
    if (!name.trim()) return;
    await createMutation.mutateAsync({ name: name.trim(), description: desc.trim() || undefined });
    setName(""); setDesc("");
    onClose();
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>

        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" />

        {/* Panel */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 animate-in fade-in slide-in-from-bottom-3 duration-300 bg-[#0a0a0a] border border-white/10 rounded-sm shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_64px_rgba(0,0,0,0.9)] overflow-hidden outline-none">

          {/* Corner accents */}
          <span className="pointer-events-none absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white/30" />
          <span className="pointer-events-none absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white/30" />
          <span className="pointer-events-none absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white/30" />
          <span className="pointer-events-none absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white/30" />

          {/* Header */}
          <div className="flex items-start justify-between px-7 pt-7">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] font-medium tracking-[0.2em] uppercase text-white/30">
                Workspace
              </span>
              <Dialog.Title className="font-serif text-[22px] font-normal tracking-tight leading-none text-white/90">
                New Project
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="mt-0.5 flex items-center justify-center rounded-sm border border-white/10 p-1.5 text-white/30 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white/80"
              >
                <X size={13} />
              </button>
            </Dialog.Close>
          </div>

          {/* Divider */}
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Body */}
          <div className="flex flex-col gap-5 px-7 pb-7 pt-6">

            {/* Project Name */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 font-mono text-[9px] font-medium tracking-[0.15em] uppercase text-white/35">
                Project Name
                <span className="inline-block h-1 w-1 rounded-full bg-white/60" title="Required" />
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="my-awesome-app"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
                className="w-full rounded-sm border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 font-mono text-[13px] font-light tracking-wide text-white/85 placeholder:text-white/20 transition-all outline-none focus:border-white/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-white/5"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[9px] font-medium tracking-[0.15em] uppercase text-white/35">
                Description
              </label>
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="What are you building?"
                className="w-full rounded-sm border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 font-mono text-[13px] font-light tracking-wide text-white/85 placeholder:text-white/20 transition-all outline-none focus:border-white/30 focus:bg-white/[0.06] focus:ring-1 focus:ring-white/5"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                className="rounded-sm border border-white/10 px-4 py-2 font-mono text-[11px] font-normal tracking-widest uppercase text-white/35 transition-all hover:border-white/20 hover:bg-white/5 hover:text-white/60"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || createMutation.isPending}
                className="flex items-center gap-1.5 rounded-sm border border-white bg-white px-5 py-2 font-mono text-[11px] font-medium tracking-widest uppercase text-black transition-all hover:bg-white/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:cursor-not-allowed disabled:opacity-25"
              >
                {createMutation.isPending ? (
                  <>
                    <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-black/20 border-t-black" />
                    Creating
                  </>
                ) : (
                  <>
                    <FolderPlus size={12} />
                    Create
                  </>
                )}
              </button>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}