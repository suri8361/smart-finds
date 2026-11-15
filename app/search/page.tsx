import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SearchResults } from "@/components/search/SearchResults";
import { getPublicProducts } from "@/lib/data/products";
import { loadCatalog } from "@/lib/data/catalog";
import { FIRST_CARDS } from "@/components/catalog/ProductGrid";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every Smart Finds pick by product, store or category.",
};

/**
 * Search page — filtering happens in the browser (components/search/SearchResults.tsx).
 * Bandwidth (Nov 4, 2026): the page carries the first cards and the list of slugs;
 * the browser loads the full product details from the free GitHub copy of the catalog.
 */
export default async function SearchPage() {
  await loadCatalog();
  const products = getPublicProducts();
  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <div className="max-w-2xl">
        <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600">Find it fast</p>
        <h1 className="mt-2 font-display text-h1 font-bold tracking-tight text-foreground">Search</h1>
      </div>
      <Suspense fallback={<div className="h-12 w-full rounded-full border border-border bg-surface" />}>
        <SearchResults initial={products.slice(0, FIRST_CARDS)} slugs={products.map((product) => product.slug)} />
      </Suspense>
    </Container>
  );
}
