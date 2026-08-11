import type { LucideIcon } from "lucide-react";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

/** Generic "nothing here yet" state — used wherever a list can legitimately be empty (product grids today, others later). */
export function EmptyState({ icon: Icon = PackageSearch, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-muted px-6 py-16 text-center">
      <Icon className="h-8 w-8 text-foreground/30" aria-hidden="true" />
      <p className="font-display text-lg text-foreground">{title}</p>
      {description ? <p className="max-w-sm text-sm text-foreground/60">{description}</p> : null}
      {action ? (
        <Button href={action.href} variant="outline" size="sm" className="mt-2">
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}
