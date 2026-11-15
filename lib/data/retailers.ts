import type { Retailer } from "@/types/catalog";
import { AMAZON_ENABLED } from "@/lib/config/affiliate";

/**
 * Placeholder retailer registry. In a later milestone this becomes the
 * `Retailer` database table (SRS §11.1) — the domain here is not used for
 * anything yet since the `/go/[linkId]` redirect handler (SRS §16.4) hasn't
 * been built.
 *
 * Amazon is listed only while AMAZON_ENABLED (lib/config/affiliate.ts) is
 * on. Walmart is still excluded — its affiliate program isn't active yet.
 * The SRS's retailer list (§1) is unaffected, since that's the long-term
 * architecture, not the current live set.
 *
 * A product shows on /retailers/[slug] when its `store` text matches the
 * retailer's `name` (case-insensitive).
 */
export const retailers: Retailer[] = [
  ...(AMAZON_ENABLED ? [{ slug: "amazon", name: "Amazon" }] : []),
  { slug: "shein", name: "SHEIN" },
  { slug: "aliexpress", name: "AliExpress" },
  { slug: "temu", name: "Temu" },
  { slug: "ebay", name: "eBay" },
];

export const retailerBySlug = Object.fromEntries(
  retailers.map((retailer) => [retailer.slug, retailer])
) as Record<string, Retailer>;
