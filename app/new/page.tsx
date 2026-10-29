import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { publicProducts } from "@/lib/data/products";

export const metadata: Metadata = {
  title: "New Finds",
  description: "The newest Smart Finds picks, latest first.",
};

/** How many of the newest finds this page lists. */
const NEW_FINDS_LIMIT = 48;

/** New Finds — the most recent posts, newest first (lib/data/products.ts keeps the newest at the top). */
export default function NewFindsPage() {
  const newest = publicProducts.filter((product) => product.image).slice(0, NEW_FINDS_LIMIT);

  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "New Finds" }]} />

      <div className="max-w-2xl">
        <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600">Just added</p>
        <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-foreground">New Finds</h1>
        <p className="mt-3 text-base text-foreground/70">The latest finds on the site, newest first.</p>
      </div>

      <ProductGrid products={newest} emptyTitle="No new finds yet" />
    </Container>
  );
}
