import type { Product } from "@/types/catalog";

/**
 * ============================================================================
 * HOME PAGE HERO PHOTOS — CHANGE BY THEMSELVES EVERY 3 DAYS
 * ============================================================================
 * The three photos next to "Smart finds, all in one place." on the home page
 * come from this list. Each entry below is one set of three:
 *   tall    the big photo on the left
 *   top     the small photo top right
 *   bottom  the small photo bottom right (shows the "Tried & True" badge when
 *           that find is marked personally_tried)
 *
 * Every 3 days (New York time, switching at midnight) the home page moves on
 * to the next set, and after the last set it starts again from the first.
 * Everyone sees the same three photos for those 3 days. No deploy is needed:
 * the home page re-checks the date by itself (see `revalidate` in app/page.tsx).
 *
 * Each value is a product slug from lib/data/products.ts, so every photo is the
 * product's own photo and links to its own page. To show a product whose head
 * gets cut off in a small square, write { slug: "...", focus: "top" } instead
 * of the plain slug ("top" keeps the top of the photo in view).
 *
 * To change the rotation: edit, add or remove sets below (keep a portrait
 * photo for `tall`). If a product here is removed from the site, its spot is
 * filled automatically from the same spot in the next set.
 * ============================================================================
 */

/** Day the first set below starts showing (New York date, YYYY-MM-DD). */
export const HERO_ROTATION_START = "2026-11-01";

/** How many days each set stays up. */
export const HERO_ROTATION_DAYS = 3;

export type HeroPhotoFocus = "top" | "center" | "bottom";
export type HeroPhotoPick = string | { slug: string; focus: HeroPhotoFocus };

export interface HeroSet {
  tall: HeroPhotoPick;
  top: HeroPhotoPick;
  bottom: HeroPhotoPick;
}

export const HERO_ROTATION: HeroSet[] = [
  // 1. Embroidered skirt set · embroidered tablecloth · autumn-leaf sweatshirt
  {
    tall: "anewsta-elegant-women-s-commuting-minimalist-summer-embroidered",
    top: "embroidered-tablecloth",
    bottom: "colorful-autumn-maple-leaf-print-crewneck-thin-sweatshirt",
  },
  // 2. Cream vacation dress · magnetic building blocks · boy's green sweater
  {
    tall: "anewsta-spring-summer-new-arrival-elegant-vacation-style",
    top: "kids-magnetic-building-blocks-3-year-olds-and",
    bottom: "cozy-pixies-baby-boy-army-green-hooded-sweatshirt",
  },
  // 3. Floral long dress · lucite challah tray · girl's floral dress
  {
    tall: "solivie-women-s-autumn-vintage-romantic-bohemian-dress",
    top: "elegant-clear-acrylic-shabbat-challah-tray-rectangular-lucite",
    bottom: "tween-girls-waist-girls-apricot-floral-print-long",
  },
  // 4. Toddler 2-piece set · enamel Dutch oven · baby boy sweatshirt
  {
    tall: "toddler-girls-2-piece-outfit-set-new-2025",
    top: "7qt-cast-iron-dutch-oven-with-lid-enameled",
    bottom: "baby-boy-casual-letter-print-embossed-sweatshirt-green",
  },
  // 5. Peach lace dress · crochet lace tablecloth · duck hoodie
  {
    tall: "anewsta-embroidered-lace-trim-spring-summer-elegant-modern",
    top: "crochet-lace-tablecloth",
    bottom: "little-girls-hooded-sweatshirt-tween-girls-graphic-print",
  },
  // 6. Purple dress · hat storage · girls' leopard dresses
  {
    tall: "anewsta-women-s-new-fashionable-elegant-valentine-s",
    top: "a-hat-storage-marvel-suitable-for-baseball-caps",
    bottom: "1pc-spring-autumn-young-girl-stylish-dress-corduroy",
  },
  // 7. Black dress with sheer sleeves · pomegranate placemats · boys' sports shirt
  {
    tall: "women-s-mock-neck-flare-sleeve-maxi-dress",
    top: "judaica-table-dinner-pomegranate-placemat-for-rosh-hashanah",
    bottom: "autumn-sports-shirt-for-young-children-and-boys",
  },
  // 8. Floral cream dress · linen tablecloth · sister outfits
  {
    tall: "shein-pregnant-women-summer-elegant-wedding-style-all",
    top: "embroidered-linen-tablecloth",
    bottom: "2026-new-spring-brown-long-sleeves-sister-clothes",
  },
  // 9. Toddler boy's wool coat · enamel tea kettle · baby sister outfits
  {
    tall: "autumn-winter-british-style-toddler-boys-children-long",
    top: "enamel-tea-kettle-teakettle-porcelain-water-kettle-classic",
    bottom: "autumn-sisters-dress-baby-bodysuit-flower-embroidery-dress",
  },
  // 10. Black floral full-skirt dress · play kitchen · girls' winter coat
  {
    tall: "anewsta-elegant-waist-cinched-full-skirt-colorful-spring",
    top: "best-choice-products-kids-wooden-cottage-play-kitchen",
    bottom: { slug: "dkny-girls-winter-coat-kids-sherpa-lined-hooded", focus: "top" },
  },
  // 11. Burgundy maternity dress · LED balloons · toddler overalls set
  {
    tall: "shein-maternity-casual-maternity-solid-color-turndown-collar",
    top: "balloons-10-strings-of-balloons-with-led-luminous",
    bottom: "souflis-souflis-2pcs-set-toddler-boys-christmas-plaid",
  },
  // 12. Cream overcoat · hand towels · toddler cotton sets
  {
    tall: "teen-girl-vintage-apricot-overcoat-with-white-fur",
    top: "soft-hand-towel",
    bottom: "2026-new-children-clothes-spring-long-sleeved-cotton",
  },
  // 13. Stand collar maxi dress · faux fur throw · girls' navy dress (the original three)
  {
    tall: "anewsta-autumn-winter-new-fashion-elegant-stand-collar",
    top: "bedsure-fluffy-bubble-faux-fur-throw-blanket-50",
    bottom: "dazy-kids-young-girl-summer-casual-sweet-cute",
  },
];

export interface HeroPhoto {
  product: Product;
  focus: HeroPhotoFocus;
}

const HERO_TIME_ZONE = "America/New_York";
const DAY_MS = 86_400_000;

/** Today's date in New York as a whole day number (days since 1970-01-01). */
function newYorkDayNumber(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: HERO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: "year" | "month" | "day") => Number(parts.find((p) => p.type === type)?.value);
  return Math.round(Date.UTC(part("year"), part("month") - 1, part("day")) / DAY_MS);
}

/** Which set of HERO_ROTATION is showing on `now` (changes every HERO_ROTATION_DAYS days at New York midnight). */
export function heroSetIndex(now: Date = new Date()): number {
  const count = HERO_ROTATION.length;
  if (count === 0) return 0;
  const [year, month, day] = HERO_ROTATION_START.split("-").map(Number);
  const startDay = Math.round(Date.UTC(year, month - 1, day) / DAY_MS);
  const slot = Math.floor((newYorkDayNumber(now) - startDay) / HERO_ROTATION_DAYS);
  return ((slot % count) + count) % count;
}

export function heroPickSlug(pick: HeroPhotoPick): string {
  return typeof pick === "string" ? pick : pick.slug;
}

export function heroPickFocus(pick: HeroPhotoPick): HeroPhotoFocus {
  return typeof pick === "string" ? "center" : pick.focus;
}
