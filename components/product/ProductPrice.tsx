import type { Product } from "@/types/catalog";
import { isAmazonProduct, showsStoredPrice } from "@/lib/affiliate";
import { AMAZON_PRICE_LABEL } from "@/lib/config/affiliate";
import { formatPrice } from "@/lib/utils/formatPrice";
import { cn } from "@/lib/utils/cn";

/**
 * A product's price. Amazon products show "Check price on Amazon" instead of
 * a stored price (Amazon's Associates rules); other stores show the stored
 * current price when there is one (original price struck through when set),
 * and "Check price on <store>" when there isn't.
 */
export function ProductPrice({ product, size = "sm" }: { product: Product; size?: "sm" | "lg" }) {
  if (!showsStoredPrice(product) || product.currentPrice === undefined) {
    const label = isAmazonProduct(product) ? AMAZON_PRICE_LABEL : `Check price on ${product.store}`;
    return <span className={cn("font-semibold text-brand-700", size === "lg" ? "text-lg" : "text-sm")}>{label}</span>;
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
