import type { Product } from "@/types/catalog";
import { AMAZON_ASSOCIATE_TAG, AMAZON_ENABLED } from "@/lib/config/affiliate";

/**
 * Affiliate link handling.
 *
 * - amazon.com links (any amazon.com subdomain, e.g. www.amazon.com) get
 *   `tag=<AMAZON_ASSOCIATE_TAG>` added when they don't already carry a tag.
 *   An existing tag is never replaced.
 * - amzn.to short links are left exactly as given: they are redirects, so a
 *   tag can't be added to them — the short link itself already carries
 *   whichever tag it was created with.
 * - Every other store's link (SHEIN, Temu, AliExpress, eBay, ...) passes
 *   through exactly as given, byte for byte.
 */

const AMAZON_HOST = /(^|\.)amazon\.com$/i;
const AMAZON_SHORT_HOST = /(^|\.)(amzn\.to|amzn\.com|a\.co)$/i;

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** True for amazon.com product links and Amazon short links (amzn.to, a.co). */
export function isAmazonUrl(url: string): boolean {
  const host = hostOf(url);
  return host !== null && (AMAZON_HOST.test(host) || AMAZON_SHORT_HOST.test(host));
}

/** True when a product is sold on Amazon — by its store name or by its link. */
export function isAmazonProduct(product: Pick<Product, "store" | "affiliateUrl">): boolean {
  return product.store.trim().toLowerCase().startsWith("amazon") || isAmazonUrl(product.affiliateUrl);
}

/** Adds the Associates tag to an amazon.com link if it has none; returns every other link unchanged. */
export function withAffiliateTag(url: string, tag: string = AMAZON_ASSOCIATE_TAG): string {
  const host = hostOf(url);
  if (!host || !AMAZON_HOST.test(host)) return url;
  const parsed = new URL(url);
  if (parsed.searchParams.has("tag")) return url;
  parsed.searchParams.set("tag", tag);
  return parsed.toString();
}

/** The link the "View Find" button should open for a product. */
export function getOutboundUrl(product: Pick<Product, "affiliateUrl">): string {
  return withAffiliateTag(product.affiliateUrl);
}

/** False for Amazon products (show "Check price on Amazon" instead of a stored price). */
export function showsStoredPrice(product: Pick<Product, "store" | "affiliateUrl">): boolean {
  return !isAmazonProduct(product);
}

/** Whether a product may appear on public pages, given the store switches in lib/config/affiliate.ts. */
export function isProductPublic(product: Pick<Product, "store" | "affiliateUrl">): boolean {
  if (isAmazonProduct(product)) return AMAZON_ENABLED;
  return true;
}
