import type { ReactNode } from "react";

/** Shared input styling for every admin product form field (Add Product, Edit Product). */
export const inputClass =
  "w-full rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
