import Link from "next/link";
import type { Category } from "@/types/catalog";

export function CategoryTile({ category }: { category: Category }) {
  const Icon = category.icon;
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-brand-300 hover:bg-taupe-200"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-taupe-200 text-brand-600 group-hover:bg-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-foreground">{category.name}</span>
        <span className="block text-xs text-foreground/60">{category.description}</span>
      </span>
    </Link>
  );
}
