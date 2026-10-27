import type { LucideIcon } from "lucide-react";

/**
 * Controlled recommendation-label vocabulary (SRS §1.2) — the only reasons a
 * product may be shown as selected for. Every product carries exactly one.
 * "personally_tried" is the only label allowed to imply firsthand use — never
 * apply it to a product nobody on the team has actually used (see the
 * warning in lib/data/products.ts above the sample data).
 */
export type SelectionReasonType =
  | "personally_tried"
  | "chosen_for_look"
  | "popular_pick"
  | "highly_rated"
  | "community_requested"
  | "great_price"
  | "trending_find";

/**
 * Who a clothing/fashion product is for (lib/data/audiences.ts has the
 * friendly display labels). Only meaningful for clothing/fashion items —
 * leave `Product.audience` unset for everything else. Keep this separate
 * from `category`: category is WHAT the item is (dresses, tops, shoes, ...),
 * audience is WHO it's for. Never encode age/gender into a category slug.
 */
export type AudienceType =
  | "women"
  | "men"
  | "girls"
  | "boys"
  | "toddler-girl"
  | "toddler-boy"
  | "baby-girl"
  | "baby-boy"
  | "unisex-kids"
  | "unisex-adult";

/**
 * WHAT a product is (lib/data/productCategories.ts has the friendly display
 * labels and which broad nav group — lib/data/categories.ts — each one rolls
 * up into, where applicable). Every clothing/fashion value here is reused
 * across every `AudienceType` — e.g. "dresses" applies equally to "women",
 * "girls", and "toddler-girl" — never create a combined slug like
 * "girls-dresses". Audience already carries WHO; this only ever carries WHAT.
 */
export type ProductCategoryType =
  | "dresses"
  | "skirts"
  | "tops"
  | "sweaters"
  | "cardigans"
  | "sets"
  | "jumpsuits"
  | "pajamas"
  | "coats-jackets"
  | "shoes"
  | "boots"
  | "sandals"
  | "sneakers"
  | "bags"
  | "accessories"
  | "shabbos-elegant"
  | "beauty"
  | "home"
  | "kitchen"
  | "organization"
  | "toys"
  | "baby-gear"
  | "school"
  | "electronics"
  | "outdoor"
  | "camping"
  | "other";

/**
 * WHEN / how a clothing/fashion product is typically worn
 * (lib/data/occasions.ts has the friendly display labels). Separate from
 * both `category` (WHAT the item is) and `audience` (WHO it's for) — e.g.
 * "Women + Skirts + Shabbos" or "Boys + Tops + Weekday" combine all three
 * independently. Only meaningful for clothing/fashion items — leave
 * `Product.occasion` unset for everything else.
 */
export type OccasionType = "weekday" | "shabbos" | "both";

/**
 * One size's measurements — keys are free-form (e.g. "waist", "hip",
 * "bust", "shoulder", "sleeveLength", "inseam", or anything else the source
 * data uses), since different clothing types need different fields. Values
 * are kept exactly as supplied — inches or centimeters, whichever the
 * source used — never parsed or auto-converted.
 */
export interface SizeMeasurement {
  size: string;
  measurements: Record<string, string>;
}

export interface Retailer {
  slug: string;
  name: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface Collection {
  slug: string;
  title: string;
  description: string;
  accent: "brand" | "amber" | "emerald" | "rose";
}

/**
 * A single product. This is the one file/shape you need to touch to add,
 * edit, or remove a product — see lib/data/products.ts for the actual data
 * and the field-by-field guide in its header comment.
 */
export interface Product {
  /** URL-safe unique identifier, e.g. "ceramic-speckled-mug". Used in /products/[slug]. */
  slug: string;
  /** Product title as shown on cards and the detail page. */
  name: string;
  /** Path or URL to a real product photo. Omit while you don't have one yet — cards fall back to a neutral placeholder. */
  image?: string;
  /** Additional gallery photos, in display order — powers the thumbnail row and lightbox on the product detail page. `image` above is typically also the first entry here; omit entirely for a single-photo product. */
  images?: string[];
  /** Current price as a plain number in USD, e.g. 19.99. Optional: when there is none (and always for Amazon), the site shows "Check price on <store>" instead. */
  currentPrice?: number;
  /** The pre-discount price, if this is a deal — shown struck through next to currentPrice. Omit if there's no discount. */
  originalPrice?: number;
  /** The real outbound affiliate/product URL. Opens in a new tab from the "View Find" button. Never shown or derived from `sourceUrl` — the two are edited independently in the admin importer. */
  affiliateUrl: string;
  /** The canonical retailer product page the admin importer scraped data from — admin-only bookkeeping, never shown publicly or used as an outbound link. Lets /admin/products/[slug]/edit re-fetch retailer data later via "Re-import retailer data." Omit for products added before this existed, or added without a source URL. */
  sourceUrl?: string;
  /** Store/retailer display name, e.g. "SHEIN", "eBay". Plain text — not tied to lib/data/retailers.ts. */
  store: string;
  /** WHAT the item is — one of the controlled values in lib/data/productCategories.ts. Never age/gender — use `audience` for that. */
  category: ProductCategoryType;
  /** Optional — must match a `Collection.slug` from lib/data/collections.ts if set. */
  collection?: string;
  /** WHO the item is for — clothing/fashion products only, omit otherwise. One of the 10 values above. */
  audience?: AudienceType;
  /** WHEN it's typically worn — clothing/fashion products only, omit otherwise. One of "weekday", "shabbos", "both". */
  occasion?: OccasionType;
  /** Exactly one label from the controlled vocabulary above. */
  recommendationLabel: SelectionReasonType;
  /** One or two sentences — shown on the card and the detail page. */
  description: string;
  sizes?: string[];
  colors?: string[];
  /** Per-size measurements (waist, hip, length, ...) — clothing only. Field names are free-form since different item types need different measurements; values are kept exactly as supplied, never unit-converted. Shown as a table on the product detail page when present. */
  sizeMeasurements?: SizeMeasurement[];
  /** Optional caveat/context shown under the measurements table, e.g. a sourcing note. */
  sizeNote?: string;
  /** Set true to feature this product in the homepage "Top Picks" section. */
  featured?: boolean;
  /** Set true to keep a product in the data but off every public page (e.g. a Temu find with no photo yet). Delete the line to show it. */
  hidden?: boolean;
}
