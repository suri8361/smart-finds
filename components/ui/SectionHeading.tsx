import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

/** Shared eyebrow + title + description + optional "view all" pattern used by every homepage section. */
export function SectionHeading({ eyebrow, title, description, action }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 font-display text-h2 font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-sm text-foreground/70">{description}</p> : null}
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {action.label}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
