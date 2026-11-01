import type { Product } from "@/types/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PriceNote } from "@/components/product/PriceNote";

export interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
  /** Show the small "prices may change" line once under the grid (default true). */
  showPriceNote?: boolean;
}

/** Shared product grid — renders an EmptyState instead of a bare empty grid when `products` is empty. */
export function ProductGrid({
  products,
  emptyTitle = "No products here yet",
  emptyDescription = "Check back soon — we're always adding new finds.",
  showPriceNote = true,
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      {showPriceNote ? <PriceNote className="mt-5 text-center sm:text-left" /> : null}
    </div>
  );
}
