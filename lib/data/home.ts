import type { Category, Product } from "@/types/catalog";
import { categories } from "@/lib/data/categories";
import { getProductsByCategoryGroup, getPublicProductBySlug, getPublicProducts } from "@/lib/data/products";
import {
  heroPickFocus,
  heroPickSlug,
  heroRotationFor,
  type HeroPhoto,
  type HeroSet,
} from "@/lib/data/hero-rotation";

/**
 * Home page picks. Every photo shown on the home page comes from a real
 * product in lib/data/products.ts (its own image and its own page) — nothing
 * here is a stock photo or a made-up item. If a slug below is ever removed or
 * hidden, the home page quietly falls back to the next product with a photo.
 */

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

const HERO_SPOTS: (keyof HeroSet)[] = ["tall", "top", "bottom"];

/**
 * The three hero photos showing on `now` (tall, top, bottom): the current set
 * of the current season from lib/data/hero-rotation.ts, which changes every 3
 * days. A product that is no longer on the site is replaced by the same spot in
 * the season's following sets, and as a last resort by the newest finds with
 * a photo.
 */
export function getHeroPhotos(now: Date = new Date()): HeroPhoto[] {
  const { sets, index: start } = heroRotationFor(now);
  const used = new Set<string>();
  const photos: HeroPhoto[] = [];
  for (const spot of HERO_SPOTS) {
    for (let step = 0; step < sets.length; step += 1) {
      const pick = sets[(start + step) % sets.length][spot];
      const product = getPublicProductBySlug(heroPickSlug(pick));
      if (!withPhoto(product) || used.has(product.slug)) continue;
      used.add(product.slug);
      photos.push({ product, focus: heroPickFocus(pick) });
      break;
    }
  }
  if (photos.length < 3) {
    for (const product of pickRow(getPublicProducts(), 3 - photos.length, used)) {
      photos.push({ product, focus: "center" });
    }
  }
  return photos;
}

/** The hero's products (same three as getHeroPhotos), e.g. so rows below don't repeat them. */
export function getHeroProducts(now: Date = new Date()): Product[] {
  return getHeroPhotos(now).map((photo) => photo.product);
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
    finds: getPublicProducts().length,
    triedAndTrue: getProductsByCategoryGroup("tried-true").length,
  };
}
