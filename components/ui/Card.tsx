import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Generic floating surface — corner radius and shadow are set once here and inherited everywhere. */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface shadow-card", className)}>{children}</div>
  );
}
