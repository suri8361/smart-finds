import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { SearchResults } from "@/components/search/SearchResults";
import { publicProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "Search",
  description: "Search every Smart Finds pick by product, store or category.",
};

/** Search page — the product list is static; filtering happens in the browser (components/search/SearchResults.tsx). */
export default function SearchPage() {
  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <div className="max-w-2xl">
        <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600">Find it fast</p>
        <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-foreground">Search</h1>
      </div>
      <Suspense fallback={<div className="h-12 w-full rounded-full border border-border bg-surface" />}>
        <SearchResults products={publicProducts} />
      </Suspense>
    </Container>
  );
}
