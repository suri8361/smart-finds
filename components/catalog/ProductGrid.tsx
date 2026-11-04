import type { Product } from "@/types/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceNote } from "@/components/product/PriceNote";
import { MoreProducts } from "@/components/catalog/MoreProducts";

/** Cards sent in the page itself when a grid is split (bandwidth, Nov 4, 2026). */
export const FIRST_CARDS = 24;

export interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
  /** Show the small "prices may change" line once under the grid (default true). */
  showPriceNote?: boolean;
  /**
   * Server pages: send only the first FIRST_CARDS cards in the page and let the
   * browser add the rest from the free GitHub copy of the catalog as the
   * visitor scrolls (components/catalog/MoreProducts.tsx). Same cards, same
   * look; far fewer bytes from Netlify.
   */
  split?: boolean;
}

/** Shared product grid — renders an EmptyState instead of a bare empty grid when `products` is empty. */
export function ProductGrid({
  products,
  emptyTitle = "No products here yet",
  emptyDescription = "Check back soon — we're always adding new finds.",
  showPriceNote = true,
  split = false,
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const first = split ? products.slice(0, FIRST_CARDS) : products;
  const rest = split ? products.slice(FIRST_CARDS).map((product) => product.slug) : [];

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {first.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
        {rest.length > 0 ? <MoreProducts slugs={rest} /> : null}
      </div>
      {showPriceNote ? <PriceNote className="mt-5 text-center sm:text-left" /> : null}
    </div>
  );
}
