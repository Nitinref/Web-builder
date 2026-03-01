"use client";
import React from "react";
import { useAppStore } from "@/store/appStore";

export function ProgressBar() {
  const { buildProgress, isBuilding } = useAppStore();

  return (
    <div className="h-[2px] w-full bg-border shrink-0 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
        style={{
          width: `${buildProgress}%`,
          opacity: isBuilding || buildProgress > 0 ? 1 : 0,
        }}
      />
    </div>
  );
}