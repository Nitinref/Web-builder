"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { projectsApi } from "@/lib/api";
import { useAppStore } from "@/store/appStore";

export function useProjects() {
  const qc = useQueryClient();
  const setActiveProject = useAppStore((s) => s.setActiveProject);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      projectsApi.create(name, description),
    onSuccess: (project: any) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setActiveProject(project);
      toast.success(`Project "${project.name}" created`);
    },
    onError: () => toast.error("Could not create project"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setActiveProject(null);
      toast.success("Project deleted");
    },
    onError: () => toast.error("Could not delete project"),
  });

  return { projects, isLoading, createMutation, deleteMutation };
}

export function useProjectFiles(projectId: string | null) {
  return useQuery({
    queryKey: ["project-files", projectId],
    queryFn: () => projectsApi.files(projectId!),
    enabled: !!projectId,
    refetchInterval: false,
  });
}

export function useFileContent(projectId: string | null, filePath: string | null) {
  return useQuery({
    queryKey: ["file-content", projectId, filePath],
    queryFn: () => projectsApi.fileContent(projectId!, filePath!),
    enabled: !!projectId && !!filePath,
  });
}