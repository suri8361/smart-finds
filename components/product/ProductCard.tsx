import Link from "next/link";
import type { Product } from "@/types/catalog";
import { RecommendationBadge } from "@/components/product/RecommendationBadge";
import { ProductImage } from "@/components/product/ProductImage";
import { Button } from "@/components/ui/Button";
import { ProductPrice } from "@/components/product/ProductPrice";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { getOutboundUrl } from "@/lib/affiliate";

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
      <div className="relative">
        <Link href={`/products/${product.slug}`} className="block">
          <ProductImage product={product} className="h-56 w-full" iconClassName="h-14 w-14 text-brand-300" />
        </Link>
        <FavoriteButton slug={product.slug} name={product.name} className="absolute right-3 top-3" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {product.recommendationLabel ? (
          <div>
            <RecommendationBadge type={product.recommendationLabel} size="sm" />
          </div>
        ) : null}

        <div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-sm font-semibold text-foreground hover:text-brand-700">{product.name}</h3>
          </Link>
          <p className="mt-1 line-clamp-2 text-sm text-foreground/70">{product.description}</p>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <ProductPrice product={product} />
          <p className="text-xs text-foreground/50">{product.store}</p>

          <Button href={getOutboundUrl(product)} target="_blank" rel="noopener noreferrer" size="sm">
            View Find
          </Button>
        </div>
      </div>
    </div>
  );
}
