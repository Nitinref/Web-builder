import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-primary text-primary-foreground",
        secondary:   "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline:     "text-foreground",
        green:       "border-green-500/30 bg-green-500/10 text-green-400",
        yellow:      "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
        purple:      "border-purple-500/30 bg-purple-500/10 text-purple-400",
        cyan:        "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };