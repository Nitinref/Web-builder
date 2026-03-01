import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function formatCost(usd: number): string {
  if (usd < 0.001) return "<$0.001";
  return "$" + usd.toFixed(4);
}

export function getFileIcon(path: string): string {
  if (path.endsWith(".tsx") || path.endsWith(".jsx")) return "⚛";
  if (path.endsWith(".ts") || path.endsWith(".js")) return "📜";
  if (path.endsWith(".css")) return "🎨";
  if (path.endsWith(".html")) return "🌐";
  if (path.endsWith(".json")) return "📋";
  return "📄";
}

export function hashColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return `hsl(${Math.abs(h) % 360}, 60%, 60%)`;
}