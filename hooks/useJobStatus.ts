"use client";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api";

export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: () => chatApi.jobStatus(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const state = query.state.data?.state;
      if (state === "completed" || state === "failed") return false;
      return 2000;
    },
  });
}