import type { Product } from "@/types/catalog";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

export interface ProductGridProps {
  products: Product[];
  emptyTitle?: string;
  emptyDescription?: string;
}

/** Shared product grid — renders an EmptyState instead of a bare empty grid when `products` is empty. */
export function ProductGrid({
  products,
  emptyTitle = "No products here yet",
  emptyDescription = "Check back soon — we're always adding new finds.",
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
