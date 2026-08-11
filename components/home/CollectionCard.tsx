import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Collection } from "@/types/catalog";
import { collectionAccentClasses } from "@/lib/utils/collectionAccent";

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-shadow hover:shadow-lg"
    >
      <div className={`h-32 bg-linear-to-br ${collectionAccentClasses[collection.accent]}`} aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-lg font-semibold text-foreground">{collection.title}</h3>
        <p className="text-sm text-foreground/70">{collection.description}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-brand-600 group-hover:text-brand-700">
          View collection
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
