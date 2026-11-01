import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomeCategory } from "@/lib/data/home";

/** Home page category tile: a real product photo from the category, its name and how many finds it holds. */
export function CategoryTile({ entry }: { entry: HomeCategory }) {
  const { category, count, cover } = entry;
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden bg-white">
        {cover?.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- product photos come from each store's own domain.
          <img
            src={cover.image}
            alt=""
            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border/70 px-3 py-3 sm:px-4">
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold leading-snug text-foreground sm:text-sm">{category.name}</span>
          <span className="block text-xs text-foreground/55">
            {count.toLocaleString("en-US")} {count === 1 ? "find" : "finds"}
          </span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-brand-600 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
    </Link>
  );
}
