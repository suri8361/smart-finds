import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Collection } from "@/types/catalog";

const accentClasses: Record<Collection["accent"], string> = {
  brand: "from-brand-200 via-brand-100 to-transparent",
  amber: "from-amber-200 via-amber-100 to-transparent",
  emerald: "from-emerald-200 via-emerald-100 to-transparent",
  rose: "from-rose-200 via-rose-100 to-transparent",
};

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-shadow hover:shadow-lg"
    >
      <div className={`h-32 bg-linear-to-br ${accentClasses[collection.accent]}`} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-base font-semibold text-foreground">{collection.title}</h3>
        <p className="text-sm text-foreground/70">{collection.description}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-brand-600 group-hover:text-brand-700">
          View collection
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
