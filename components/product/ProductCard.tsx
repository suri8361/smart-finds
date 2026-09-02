import Link from "next/link";
import type { Product } from "@/types/catalog";
import { RecommendationBadge } from "@/components/product/RecommendationBadge";
import { ProductImage } from "@/components/product/ProductImage";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils/formatPrice";

/**
 * Reusable product card. The image and title link to the internal
 * `/products/[slug]` detail page; "View Find" is the one element that opens
 * the real outbound affiliate URL, and does so safely — `target="_blank"`
 * paired with `rel="noopener noreferrer"` so the new tab can't reach back
 * into this page via `window.opener` (a standard tab-nabbing mitigation).
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-shadow hover:shadow-lg">
      <Link href={`/products/${product.slug}`} className="block">
        <ProductImage product={product} className="h-56 w-full" iconClassName="h-14 w-14 text-brand-300" />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <RecommendationBadge type={product.recommendationLabel} size="sm" />
        </div>

        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-foreground hover:text-brand-700">{product.name}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-foreground/70">{product.description}</p>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-foreground">{formatPrice(product.currentPrice)}</span>
            {product.originalPrice ? (
              <span className="text-xs text-foreground/40 line-through">{formatPrice(product.originalPrice)}</span>
            ) : null}
          </div>
          <p className="text-xs text-foreground/50">{product.store}</p>

          <Button href={product.affiliateUrl} target="_blank" rel="noopener noreferrer" size="sm">
            View Find
          </Button>
        </div>
      </div>
    </div>
  );
}
