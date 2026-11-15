import type { Product } from "@/types/catalog";
import { showsStoredPrice } from "@/lib/affiliate";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";

/**
 * A product's price: the stored current price (original price struck through
 * when set). Amazon products never show a price (Amazon's Associates rules),
 * and products without a stored price show nothing here at all — the store
 * name and "View Find" button carry the card.
 */
export function ProductPrice({ product, size = "sm" }: { product: Product; size?: "sm" | "lg" }) {
  if (!showsStoredPrice(product) || product.currentPrice === undefined) return null;
  return (
    <div className={cn("flex items-baseline", size === "lg" ? "gap-3" : "gap-2")}>
      <span className={cn("font-semibold text-foreground", size === "lg" ? "text-2xl" : "text-sm")}>
        {formatPrice(product.currentPrice)}
      </span>
      {product.originalPrice ? (
        <span className={cn("text-foreground/40 line-through", size === "lg" ? "text-sm" : "text-xs")}>
          {formatPrice(product.originalPrice)}
        </span>
      ) : null}
    </div>
  );
}
