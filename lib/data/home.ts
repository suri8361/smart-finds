import type { Category, Product } from "@/types/catalog";
import { categories } from "@/lib/data/categories";
import { getProductsByCategoryGroup, getPublicProductBySlug, publicProducts } from "@/lib/data/products";

/**
 * Home page picks. Every photo shown on the home page comes from a real
 * product in lib/data/products.ts (its own image and its own page) — nothing
 * here is a stock photo or a made-up item. If a slug below is ever removed or
 * hidden, the home page quietly falls back to the next product with a photo.
 */

/** The three products in the hero collage (first one is the large photo; the last is a Tried & True find). */
const HERO_PRODUCT_SLUGS = [
  "anewsta-autumn-winter-new-fashion-elegant-stand-collar",
  "bedsure-fluffy-bubble-faux-fur-throw-blanket-50",
  "dazy-kids-young-girl-summer-casual-sweet-cute",
];

/** The photo used on each category tile (a product from that category). */
const CATEGORY_COVER_SLUGS: Record<string, string> = {
  "home-kitchen": "farberware-forged-induction-ceramic-nonstick-cookware-set-12",
  "tech-electronics": "kodak-pixpro-fz45-16mp-compact-digital-camera-4x",
  "fashion-style": "project-cloud-100-genuine-leather-micro-boots-for",
  "shabbos-elegant": "european-and-american-style-mesh-long-sleeved-a",
  "yom-tov-holidays": "upgraded-37-keys-kids-piano-keyboard-with-mic",
  "tried-true": "women-s-tall-waterproof-rain-boots-rubber-wide",
  "home-office": "a-hat-storage-marvel-suitable-for-baseball-caps",
  toys: "kids-magnetic-building-blocks-3-year-olds-and",
  "baby-gear": "stokke-yoyo3-travel-stroller-from-6-months-easy",
  other: "delsey-paris-chatelet-air-2-0-hardside-luggage",
};

/** A category needs at least this many finds to get a tile on the home page (thinner ones stay in the menu and footer). */
const MIN_FINDS_FOR_HOME_TILE = 6;

const withPhoto = (product: Product | undefined): product is Product => Boolean(product?.image);

/** Same item listed twice (e.g. two colours) shouldn't sit side by side in a row. */
function nameKey(product: Product): string {
  return product.name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").slice(0, 4).join(" ");
}

/** Products with a photo, one per item name, up to `limit`. */
export function pickRow(products: Product[], limit = 8, exclude: Set<string> = new Set()): Product[] {
  const seen = new Set<string>();
  const row: Product[] = [];
  for (const product of products) {
    if (!product.image || exclude.has(product.slug)) continue;
    const key = nameKey(product);
    if (seen.has(key)) continue;
    seen.add(key);
    row.push(product);
    if (row.length === limit) break;
  }
  return row;
}

export function getHeroProducts(): Product[] {
  const chosen = HERO_PRODUCT_SLUGS.map((slug) => getPublicProductBySlug(slug)).filter(withPhoto);
  if (chosen.length >= 3) return chosen.slice(0, 3);
  const fill = pickRow(publicProducts, 3 - chosen.length, new Set(chosen.map((p) => p.slug)));
  return [...chosen, ...fill];
}

export interface HomeCategory {
  category: Category;
  count: number;
  cover?: Product;
}

/** Categories with a cover photo; the home page passes the default minimum, /categories passes 1. */
export function getHomeCategories(minFinds = MIN_FINDS_FOR_HOME_TILE): HomeCategory[] {
  return categories
    .map((category) => {
      const products = getProductsByCategoryGroup(category.slug);
      const preferred = CATEGORY_COVER_SLUGS[category.slug];
      const cover = products.find((p) => p.slug === preferred && p.image) ?? products.find((p) => p.image);
      return { category, count: products.length, cover };
    })
    .filter((entry) => entry.count >= minFinds && entry.cover);
}

export function getHomeStats() {
  return {
    finds: publicProducts.length,
    triedAndTrue: getProductsByCategoryGroup("tried-true").length,
    stores: new Set(publicProducts.map((p) => p.store.trim().toLowerCase())).size,
  };
}
