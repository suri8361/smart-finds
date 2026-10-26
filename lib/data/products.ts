import type { AudienceType, OccasionType, Product, ProductCategoryType } from "@/types/catalog";
import { getProductCategoriesInGroup } from "@/lib/data/productCategories";
import { isProductPublic } from "@/lib/affiliate";

/**
 * ============================================================================
 * SAMPLE / PLACEHOLDER PRODUCTS — REPLACE ME
 * ============================================================================
 * The 6 products below exist only so you can see the site with real-looking
 * data in place. Every slug is prefixed `sample-` and every affiliateUrl
 * points at example.com specifically so they're impossible to mistake for
 * real, live products. Replace or delete them as you add your own.
 *
 * To add a real product: copy one of the objects below, then fill in:
 *   slug              unique, URL-safe, e.g. "ceramic-speckled-mug"
 *   name              product title
 *   image             path/URL to a real photo (omit for now and the card
 *                      will show a neutral placeholder instead)
 *   currentPrice      plain number, USD, e.g. 19.99
 *   originalPrice     optional — only set this if it's a genuine discount
 *   affiliateUrl      the real outbound affiliate/product link
 *   store             plain text store name, e.g. "SHEIN", "eBay"
 *   category          WHAT the item is — one of the specific values in
 *                      lib/data/productCategories.ts (ProductCategoryType in
 *                      types/catalog.ts), e.g. "dresses", "tops", "shoes".
 *                      Never age/gender — that's `audience`.
 *   collection        optional — must match a slug in lib/data/collections.ts
 *   audience          optional, clothing/fashion items only — WHO it's for.
 *                      One of the 10 values in lib/data/audiences.ts
 *                      (AudienceType in types/catalog.ts). Omit for anything
 *                      that isn't clothing/fashion.
 *   occasion          optional, clothing/fashion items only — WHEN it's
 *                      typically worn: "weekday", "shabbos", or "both". See
 *                      lib/data/occasions.ts (OccasionType in
 *                      types/catalog.ts). Omit for anything that isn't
 *                      clothing/fashion.
 *   recommendationLabel  exactly one of the 7 values in types/catalog.ts
 *                      (SelectionReasonType) — do not use "personally_tried"
 *                      unless someone on the team genuinely used the product
 *   description       one or two honest sentences
 *   sizes / colors    optional string arrays
 *   featured          set true to show it in the homepage "Top Picks" section
 *
 * None of these samples use "personally_tried" — that label claims real
 * firsthand use, which doesn't apply to placeholder data (see SRS §1.2).
 * Only add it to a product your team has actually tried.
 */
export const products: Product[] = [
  {
    slug: "sample-ceramic-speckled-mug",
    name: "Ceramic Speckled Coffee Mug",
    currentPrice: 14.99,
    originalPrice: 19.99,
    affiliateUrl: "https://example.com/sample-product-1",
    store: "SHEIN",
    category: "kitchen",
    collection: "under-50-desk-upgrades",
    recommendationLabel: "great_price",
    description: "A speckled stoneware mug that looks pricier than it is — a small daily upgrade for coffee or tea.",
    featured: true,
  },
  {
    slug: "sample-compact-wireless-earbuds",
    name: "Compact Wireless Earbuds",
    currentPrice: 24.99,
    originalPrice: 34.99,
    affiliateUrl: "https://example.com/sample-product-2",
    store: "AliExpress",
    category: "electronics",
    collection: "everyday-carry-tech",
    recommendationLabel: "highly_rated",
    description: "A compact charging case and surprisingly clear sound for the price — a popular pick for commutes.",
    colors: ["Black", "White"],
    featured: true,
  },
  {
    slug: "sample-relaxed-linen-shirt",
    name: "Relaxed Linen-Blend Shirt",
    currentPrice: 22.0,
    affiliateUrl: "https://example.com/sample-product-3",
    store: "SHEIN",
    category: "tops",
    audience: "women",
    recommendationLabel: "chosen_for_look",
    description: "An easy, oversized linen-blend shirt chosen for the drape and warm-weather versatility.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Sand", "White", "Olive"],
    featured: false,
  },
  {
    slug: "sample-jade-facial-roller",
    name: "Jade Facial Roller Set",
    currentPrice: 9.99,
    affiliateUrl: "https://example.com/sample-product-4",
    store: "Temu",
    category: "beauty",
    collection: "trending-beauty-tools",
    recommendationLabel: "community_requested",
    description: "Requested by members looking for an affordable at-home facial massage tool.",
    featured: true,
  },
  {
    slug: "sample-collapsible-camp-lantern",
    name: "Collapsible LED Camp Lantern",
    currentPrice: 16.5,
    originalPrice: 21.0,
    affiliateUrl: "https://example.com/sample-product-5",
    store: "eBay",
    category: "camping",
    collection: "warm-weather-camp-essentials",
    recommendationLabel: "trending_find",
    description: "Packs flat, lights up a whole tent, and keeps showing up in camping roundups this season.",
    featured: false,
  },
  {
    slug: "sample-bamboo-desk-organizer",
    name: "Bamboo Desk Organizer",
    currentPrice: 18.25,
    affiliateUrl: "https://example.com/sample-product-6",
    store: "AliExpress",
    category: "organization",
    collection: "under-50-desk-upgrades",
    recommendationLabel: "popular_pick",
    description: "One of the better-selling desk organizers in its category — simple, tidy, and easy to justify.",
    featured: true,
  },
  {
    slug: "burgundy-pu-panel-a-line-skirt",
    name: "Burgundy PU Panel A-Line Skirt",
    image: "https://img.ltwebstatic.com/v4/j/dps/PS202608274469/1c7ba800d9fd868d031991ed546efab900e8553f10907d9e94add001e6b7259e_thumbnail_405x552.jpg",
    currentPrice: 30.74,
    affiliateUrl: "https://onelink.shein.com/50/60mti28yrwqu?ismg_ol=FapXPlvHhiC_01_KOC-C",
    store: "SHEIN",
    category: "skirts",
    audience: "women",
    recommendationLabel: "chosen_for_look",
    description: "Elegant burgundy A-line skirt with a sleek PU panel detail.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Burgundy"],
    featured: true,
  },
];

/**
 * Products that may appear on public pages. Products from a store that's
 * switched off in lib/config/affiliate.ts (Amazon, for now) are left out.
 * Every public lookup below reads this list; the local admin tool still sees
 * the full `products` list.
 */
export const publicProducts: Product[] = products.filter(isProductPublic);

/** Any product by slug, including ones from a switched-off store — admin use. */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

/** A product by slug, only if it may appear on public pages. */
export function getPublicProductBySlug(slug: string): Product | undefined {
  return publicProducts.find((product) => product.slug === slug);
}

/** Products with this exact specific category (e.g. "dresses"). */
export function getProductsByCategory(category: ProductCategoryType): Product[] {
  return publicProducts.filter((product) => product.category === category);
}

/** Products whose specific category rolls up into a given broad nav group (lib/data/categories.ts slug) — powers /category/[slug]. */
export function getProductsByCategoryGroup(categoryGroupSlug: string): Product[] {
  const categoriesInGroup = new Set(getProductCategoriesInGroup(categoryGroupSlug));
  return publicProducts.filter((product) => categoriesInGroup.has(product.category));
}

/** Products from one store, matched case-insensitively on the `store` text — powers /retailers/[slug]. */
export function getProductsByStore(storeName: string): Product[] {
  const wanted = storeName.trim().toLowerCase();
  return publicProducts.filter((product) => product.store.trim().toLowerCase() === wanted);
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  return publicProducts.filter((product) => product.collection === collectionSlug);
}

/** Products for a given audience (clothing/fashion items only carry this field). */
export function getProductsByAudience(audience: AudienceType): Product[] {
  return publicProducts.filter((product) => product.audience === audience);
}

/** Products matching both category (WHAT) and audience (WHO) — e.g. "dresses" for "women". */
export function getProductsByCategoryAndAudience(category: ProductCategoryType, audience: AudienceType): Product[] {
  return publicProducts.filter((product) => product.category === category && product.audience === audience);
}

/** Products for a given occasion (clothing/fashion items only carry this field) — e.g. "shabbos". */
export function getProductsByOccasion(occasion: OccasionType): Product[] {
  return publicProducts.filter((product) => product.occasion === occasion);
}

/** Products matching both audience (WHO) and occasion (WHEN) — e.g. "women" for "shabbos". */
export function getProductsByAudienceAndOccasion(audience: AudienceType, occasion: OccasionType): Product[] {
  return publicProducts.filter((product) => product.audience === audience && product.occasion === occasion);
}

/** Products matching both category (WHAT) and occasion (WHEN) — e.g. "skirts" for "shabbos". */
export function getProductsByCategoryAndOccasion(category: ProductCategoryType, occasion: OccasionType): Product[] {
  return publicProducts.filter((product) => product.category === category && product.occasion === occasion);
}

/** Products matching category (WHAT), audience (WHO), and occasion (WHEN) together — e.g. "skirts" for "women" for "shabbos". */
export function getProductsByCategoryAudienceAndOccasion(
  category: ProductCategoryType,
  audience: AudienceType,
  occasion: OccasionType
): Product[] {
  return publicProducts.filter(
    (product) => product.category === category && product.audience === audience && product.occasion === occasion
  );
}

/** Products with `featured: true` — powers the homepage "Top Picks" section. */
export function getFeaturedProducts(): Product[] {
  return publicProducts.filter((product) => product.featured);
}

/** Other products in the same category, excluding the product itself — powers "Related Products" on the product detail page. */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return publicProducts.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, limit);
}
