"use client";
import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-card border border-border rounded-xl p-6 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-base font-bold">New Project</Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </Dialog.Close>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Project Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome App"
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <Input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="What are you building?"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <Button onClick={onClose}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!name.trim() || createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}