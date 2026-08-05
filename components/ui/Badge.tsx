import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Generic pill badge. Deliberately unstyled on color — callers supply
 * background/text/ring classes via `className` so this stays reusable for
 * any future badge type, not just recommendation labels (see
 * components/product/RecommendationBadge.tsx for that specific usage).
 */
export function Badge({ children, icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
