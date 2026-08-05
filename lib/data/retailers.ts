import type { Retailer } from "@/types/catalog";

/**
 * Placeholder retailer registry. In a later milestone this becomes the
 * `Retailer` database table (SRS §11.1) — the domain here is not used for
 * anything yet since the `/go/[linkId]` redirect handler (SRS §16.4) hasn't
 * been built.
 *
 * Amazon and Walmart are deliberately excluded for now — those affiliate
 * programs aren't active yet. Add them back here once they are; the SRS's
 * retailer list (§1) is unaffected, since that's the long-term architecture,
 * not the current live set.
 */
export const retailers: Retailer[] = [
  { slug: "shein", name: "SHEIN" },
  { slug: "aliexpress", name: "AliExpress" },
  { slug: "temu", name: "Temu" },
  { slug: "ebay", name: "eBay" },
];

export const retailerBySlug = Object.fromEntries(
  retailers.map((retailer) => [retailer.slug, retailer])
) as Record<string, Retailer>;
