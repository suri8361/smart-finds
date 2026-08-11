import Link from "next/link";
import type { Product } from "@/types/catalog";
import { Button } from "@/components/ui/Button";
import { formatPriceBand } from "@/lib/utils/formatPrice";

/**
 * Retailer CTA block ("buy box") — one row per retailer the product is
 * available from, each with its own price band and "Check current price"
 * button. Links target `/go/[productSlug]--[retailerSlug]`, the placeholder
 * for the SRS §16.4 redirect handler; that handler (with its domain
 * allow-list safety check) isn't built yet, so these currently 404 — this
 * milestone only builds the page UI. Disclosure copy matches the hero's
 * wording verbatim so the trust language stays consistent site-wide.
 */
export function ProductBuyBox({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-muted p-5">
      {product.retailerLinks.map((link, index) => (
        <div
          key={link.retailer.slug}
          className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
        >
          <div>
            <p className="text-sm font-semibold text-foreground">{link.retailer.name}</p>
            <p className="text-sm text-foreground/60">
              {formatPriceBand(link.priceLow, link.priceHigh, link.currency, link.lastCheckedAt)}
            </p>
          </div>
          <Button
            href={`/go/${product.slug}--${link.retailer.slug}`}
            variant={index === 0 ? "primary" : "outline"}
            size="md"
          >
            Check current price
          </Button>
        </div>
      ))}

      <p className="text-xs leading-relaxed text-foreground/50">
        Some links on Smart Finds are{" "}
        <Link
          href="/legal/affiliate-disclosure"
          className="underline decoration-foreground/30 underline-offset-2 transition-colors hover:text-foreground/75"
        >
          affiliate links
        </Link>
        . If you purchase through them, we may earn a commission at no extra cost to you.
      </p>
    </div>
  );
}
