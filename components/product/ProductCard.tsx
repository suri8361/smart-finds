import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/types/catalog";
import { categories } from "@/lib/data/categories";
import { RecommendationBadge } from "@/components/product/RecommendationBadge";
import { formatPriceBand } from "@/lib/utils/formatPrice";

/**
 * Placeholder product card (SRS §6, scaled down for a grid context). The
 * whole card links to the `/products/[slug]` detail page rather than an
 * affiliate redirect — outbound `/go/[linkId]` links carry real safety
 * requirements (SRS §16.4) that are still out of scope, so the card doesn't
 * imply that flow works yet even though the detail page itself now does.
 */
export function ProductCard({ product }: { product: Product }) {
  const category = categories.find((c) => c.slug === product.categorySlug);
  const CategoryIcon = category?.icon;
  const primaryLink = product.retailerLinks[0];
  const ratingReason = product.selectionReasons.find((reason) => reason.type === "highly_rated");
  const rating = ratingReason?.evidence.rating;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition-shadow hover:shadow-lg"
    >
      <div className="flex h-40 items-center justify-center bg-taupe-200">
        {CategoryIcon ? <CategoryIcon className="h-10 w-10 text-brand-300" aria-hidden="true" /> : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-1.5">
          {product.selectionReasons.map((reason) => (
            <RecommendationBadge key={reason.type} type={reason.type} />
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-700">{product.title}</h3>
          <p className="mt-1 text-sm text-foreground/70">{product.summary}</p>
        </div>

        {rating ? (
          <div className="flex items-center gap-1 text-xs text-foreground/60">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
            {rating.value.toFixed(1)} ({rating.count.toLocaleString()} ratings on {rating.source})
          </div>
        ) : null}

        <div className="mt-auto pt-2">
          <p className="text-sm font-semibold text-foreground">
            {formatPriceBand(primaryLink.priceLow, primaryLink.priceHigh, primaryLink.currency, primaryLink.lastCheckedAt)}
          </p>
          <p className="text-xs text-foreground/50">
            Available at {product.retailerLinks.map((link) => link.retailer.name).join(" · ")}
          </p>
        </div>
      </div>
    </Link>
  );
}
