import type { Product } from "@/types/catalog";
import { showsStoredPrice } from "@/lib/affiliate";
import { AMAZON_PRICE_LABEL } from "@/lib/config/affiliate";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";

/**
 * A product's price. Amazon products show "Check price on Amazon" instead of
 * a stored price (Amazon's Associates rules); every other store shows the
 * stored current price, with the original price struck through when set.
 */
export function ProductPrice({ product, size = "sm" }: { product: Product; size?: "sm" | "lg" }) {
  if (!showsStoredPrice(product)) {
    return (
      <span className={cn("font-semibold text-brand-700", size === "lg" ? "text-lg" : "text-sm")}>{AMAZON_PRICE_LABEL}</span>
    );
  }
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
