import type { Product } from "@/types/catalog";

/**
 * ============================================================================
 * HOME PAGE HERO PHOTOS — FOLLOW THE SEASON, CHANGE EVERY 3 DAYS
 * ============================================================================
 * The three photos next to "Smart finds, all in one place." on the home page
 * come from the lists below. There is one list per season, and the season is
 * picked by itself from today's date in New York:
 *
 *   Winter  November, December, January, February
 *   Spring  March, April
 *   Summer  May, June, July, August
 *   Fall    September, October
 *
 * (To move a month to another season, change SEASON_OF_MONTH below.)
 *
 * Inside a season, the photos move to the next set every 3 days (at midnight
 * New York time), starting from set 1 on the season's first day, and after
 * the last set they start again from set 1. Everyone sees the same three
 * photos for those 3 days. No deploy is needed: the home page re-checks the
 * date by itself (see `revalidate` in app/page.tsx).
 *
 * Each set is three photos:
 *   tall    the big photo on the left
 *   top     the small photo top right
 *   bottom  the small photo bottom right (shows the "Tried & True" badge when
 *           that find is marked personally_tried)
 *
 * Each value is a product slug from lib/data/products.ts, so every photo is the
 * product's own photo and links to its own page. To show a product whose head
 * gets cut off in a small square, write { slug: "...", focus: "top" } instead
 * of the plain slug ("top" keeps the top of the photo in view).
 *
 * Rules for picking photos: modest only (never sleeveless), real photos that
 * fill the space (no text or watermarks on the photo), faces not cut off, and
 * clothes that fit the season (no summer looks in winter).
 *
 * To change a season: edit, add or remove sets in its list (keep a portrait
 * photo for `tall`). If a product here is removed from the site, its spot is
 * filled automatically from the same spot in the next set of that season.
 * ============================================================================
 */

export type HeroSeason = "winter" | "spring" | "summer" | "fall";

/** Which season each month belongs to (1 = January … 12 = December). */
export const SEASON_OF_MONTH: Record<number, HeroSeason> = {
  1: "winter",
  2: "winter",
  3: "spring",
  4: "spring",
  5: "summer",
  6: "summer",
  7: "summer",
  8: "summer",
  9: "fall",
  10: "fall",
  11: "winter",
  12: "winter",
};

/** How many days each set stays up. */
export const HERO_ROTATION_DAYS = 3;

export type HeroPhotoFocus = "top" | "center" | "bottom";
export type HeroPhotoPick = string | { slug: string; focus: HeroPhotoFocus };

export interface HeroSet {
  tall: HeroPhotoPick;
  top: HeroPhotoPick;
  bottom: HeroPhotoPick;
}

export const HERO_SEASONS: Record<HeroSeason, HeroSet[]> = {
  // WINTER (Nov–Feb): sweaters, coats, velvet, warm colors, cozy home.
  winter: [
    // 1. Cream overcoat with fur collar · grey crystal-collar sweater · girl's sherpa puffer coat
    {
      tall: "teen-girl-vintage-apricot-overcoat-with-white-fur",
      top: { slug: "anewsta-handmade-crystal-velvet-commuter-christmas-round-neck", focus: "top" },
      bottom: { slug: "dkny-girls-winter-coat-kids-sherpa-lined-hooded", focus: "top" },
    },
    // 2. Black sweater & tweed skirt · faux fur throw · boys' wool coats
    {
      tall: "mobula-sound-spring-autumn-versatile-fashion-tweed-button",
      top: { slug: "bedsure-fluffy-bubble-faux-fur-throw-blanket-50", focus: "top" },
      bottom: { slug: "winter-woolen-jacket-for-boy-new-2024-korean", focus: "top" },
    },
    // 3. Stand collar maxi dress · brown wool sweater · girls' plaid pinafore
    {
      tall: "anewsta-autumn-winter-new-fashion-elegant-stand-collar",
      top: { slug: "anewsta-autumn-winter-elegant-wool-blend-solid-color", focus: "top" },
      bottom: { slug: "girls-korean-style-academy-retro-plaid-outfit-vintage", focus: "top" },
    },
    // 4. Brown satin shirt dress · red enamel Dutch oven · girls' velvet Shabbos sets
    {
      tall: "balvessa-women-s-elegant-commute-shirt-and-skirt",
      top: "7qt-cast-iron-dutch-oven-with-lid-enameled",
      bottom: { slug: "bloom-kids-velvet-shabbos-2-piece-set-for", focus: "top" },
    },
    // 5. Knit cardigan & long skirt · wool knit beanie · kids' down coats
    {
      tall: "knit-sweaters-cropped-cardigan-woman-knitwear-fashion-casual",
      top: { slug: "roybens-womens-satin-lined-beanie-for-men-wool", focus: "top" },
      bottom: { slug: "ap-2025-winter-design-waterproof-fabric-children-down", focus: "top" },
    },
    // 6. Burgundy maternity dress · navy rhinestone velvet sweater · baby velvet overcoat
    {
      tall: "shein-maternity-casual-maternity-solid-color-turndown-collar",
      top: { slug: "anewsta-handmade-rhinestone-soft-velvet-commuter-christmas-crew", focus: "top" },
      bottom: { slug: "souflis-french-vintage-autumn-winter-new-thickened-long", focus: "top" },
    },
    // 7. Black velvet & satin gown · enamel tea kettle · girl's burgundy corduroy dress
    {
      tall: "women-s-round-neck-long-sleeve-paneled-maxi",
      top: "enamel-tea-kettle-teakettle-porcelain-water-kettle-classic",
      bottom: { slug: "playful-pals-young-girl-casual-solid-color-corduroy", focus: "top" },
    },
    // 8. Lantern sleeve satin dress · knit pullover in the snow · girls' wool coats
    {
      tall: "lilora-solid-lantern-sleeve-satin-dress",
      top: { slug: "firerie-plus-size-women-solid-color-crew-neck", focus: "top" },
      bottom: { slug: "kids-winter-wool-blend-coats-vintage-fashion-teen", focus: "top" },
    },
    // 9. Velvet dress set · kids' leather snow boots · toddler plaid jumper & turtleneck
    {
      tall: "as-2024-fall-winter-velvet-woman-clothes-adjustable",
      top: "2025-new-winter-baby-snow-boots-leather-warm",
      bottom: { slug: "toddler-girls-2-piece-outfit-set-new-2025", focus: "top" },
    },
    // 10. Embroidered sweater & skirt · grey beaded cardigan · girl's turtleneck & suspender dress
    {
      tall: "as-aw26-trendy-woman-teen-clothes-embroidered-crewneck",
      top: { slug: "anewsta-gray-french-design-beaded-decoration-knit-cardigan", focus: "top" },
      bottom: { slug: "blossori-young-girls-french-elegant-stand-collar-long", focus: "top" },
    },
    // 11. Brown belted maxi dress · crew neck knit sweater · girl's brown plaid dress
    {
      tall: "glimmora-women-s-fashion-vintage-solid-color-cross",
      top: { slug: "shein-parichic-casual-style-solid-color-crew-neck", focus: "top" },
      bottom: { slug: "shein-young-girl-fall-woven-plaid-casual-dress", focus: "top" },
    },
    // 12. Navy shirt dress · off-white sweater · girl's contrast collar jacket
    {
      tall: "2026-spring-summer-elegant-cotton-linen-blend-buttoned",
      top: { slug: "shein-autumn-winter-going-out-casual-french-classic", focus: "top" },
      bottom: { slug: "elladie-kids-1pc-young-girl-comfortable-casual-elegant", focus: "top" },
    },
    // 13. Brown long sleeve dress · drop-shoulder sweater · baby boy's quilted hoodie
    {
      tall: "long-sleeve-plaid-dress",
      top: { slug: "shein-maternity-drop-shoulder-long-sleeve-sweater-for", focus: "top" },
      bottom: { slug: "cozy-pixies-baby-boy-army-green-hooded-sweatshirt", focus: "top" },
    },
  ],

  // SPRING (Mar–Apr): light dresses, soft colors, Pesach table.
  spring: [
    // 1. Women's Embroidered Lace A-Line Dress · Lucite Shabbat Challah Tray · Baby Girl Heart Corduroy Pinafore Dress
    {
      tall: "anewsta-embroidered-lace-trim-spring-summer-elegant-modern",
      top: "elegant-clear-acrylic-shabbat-challah-tray-rectangular-lucite",
      bottom: "shein-babygirl-pink-cute-heart-pattern-pinafore-dress",
    },
    // 2. Women's Elegant Shirt Dress · Crochet Lace Tablecloth · Baby Girls' Embroidered Dress Set
    {
      tall: "anewsta-women-s-new-fashionable-elegant-valentine-s",
      top: "crochet-lace-tablecloth",
      bottom: { slug: "autumn-sisters-dress-baby-bodysuit-flower-embroidery-dress", focus: "top" },
    },
    // 3. Floral Polka Dot Puff Sleeve Dress · Soft Hand Towel · Little Girls Graphic Print Hoodie
    {
      tall: "anewsta-spring-summer-new-arrival-elegant-vacation-style",
      top: "soft-hand-towel",
      bottom: { slug: "little-girls-hooded-sweatshirt-tween-girls-graphic-print", focus: "top" },
    },
    // 4. Colorblock Geometric Maxi Shirt Dress · Kids' Magnetic Building Blocks STEM Toy · Girls Apricot Floral Long Sleeve Shift Dress
    {
      tall: "aveloria-modichic-spring-summer-black-white-yellow-red",
      top: "kids-magnetic-building-blocks-3-year-olds-and",
      bottom: { slug: "tween-girls-waist-girls-apricot-floral-print-long", focus: "top" },
    },
    // 5. Women's Floral Organza Dress · Embroidered Linen Tablecloth · Baby Romper & Girls' Dress Set
    {
      tall: "anewsta-elegant-waist-cinched-full-skirt-colorful-spring",
      top: "embroidered-linen-tablecloth",
      bottom: { slug: "2026-new-children-clothes-spring-long-sleeved-cotton", focus: "top" },
    },
  ],

  // SUMMER (May–Aug): light fabrics and puff sleeves (still modest: no sleeveless).
  summer: [
    // 1. Women's Embroidered Puff Sleeve Shirt Set · Crochet Lace Tablecloth · Girls Apricot Floral Long Sleeve Shift Dress
    {
      tall: "anewsta-elegant-women-s-commuting-minimalist-summer-embroidered",
      top: "crochet-lace-tablecloth",
      bottom: { slug: "tween-girls-waist-girls-apricot-floral-print-long", focus: "top" },
    },
    // 2. Maternity Floral Puff Sleeve Dress · Kids' Magnetic Building Blocks STEM Toy · Baby Romper & Girls' Dress Set
    {
      tall: "shein-pregnant-women-summer-elegant-wedding-style-all",
      top: "kids-magnetic-building-blocks-3-year-olds-and",
      bottom: { slug: "2026-new-children-clothes-spring-long-sleeved-cotton", focus: "top" },
    },
    // 3. Off-White Puff Sleeve Pintuck Gown · Soft Hand Towel · Girls Ditsy Floral Peter Pan Collar Blouse
    {
      tall: "enchnt-off-white-summer-elegant-wedding-guest-women",
      top: "soft-hand-towel",
      bottom: { slug: "loomiva-young-girl-ditsy-floral-peter-pan-collar", focus: "top" },
    },
    // 4. Floral Polka Dot Puff Sleeve Dress · LED Luminous Balloons · Baby Girls' Embroidered Dress Set
    {
      tall: "anewsta-spring-summer-new-arrival-elegant-vacation-style",
      top: "balloons-10-strings-of-balloons-with-led-luminous",
      bottom: { slug: "autumn-sisters-dress-baby-bodysuit-flower-embroidery-dress", focus: "top" },
    },
    // 5. Colorblock Geometric Maxi Shirt Dress · Lucite Shabbat Challah Tray · Kids Wooden Cottage Play Kitchen
    {
      tall: "aveloria-modichic-spring-summer-black-white-yellow-red",
      top: "elegant-clear-acrylic-shabbat-challah-tray-rectangular-lucite",
      bottom: "best-choice-products-kids-wooden-cottage-play-kitchen",
    },
  ],

  // FALL (Sep–Oct): browns and rust, Yom Tov table, early sweaters.
  fall: [
    // 1. Elegant Printed Maxi Dress · Rosh Hashanah Pomegranate Placemats · Girls Maple Leaf Print Sweatshirt
    {
      tall: "solivie-women-s-autumn-vintage-romantic-bohemian-dress",
      top: "judaica-table-dinner-pomegranate-placemat-for-rosh-hashanah",
      bottom: { slug: "colorful-autumn-maple-leaf-print-crewneck-thin-sweatshirt", focus: "top" },
    },
    // 2. Embroidered Crewneck Sweater · 7QT Enameled Cast Iron Dutch Oven · Girls Corduroy Leopard Dress
    {
      tall: "as-aw26-trendy-woman-teen-clothes-embroidered-crewneck",
      top: "7qt-cast-iron-dutch-oven-with-lid-enameled",
      bottom: { slug: "1pc-spring-autumn-young-girl-stylish-dress-corduroy", focus: "top" },
    },
    // 3. Women's Brown Maxi Dress · Lucite Shabbat Challah Tray · Boys Tractor Print Sweatshirt
    {
      tall: "glimmora-women-s-fashion-vintage-solid-color-cross",
      top: "elegant-clear-acrylic-shabbat-challah-tray-rectangular-lucite",
      bottom: { slug: "autumn-sports-shirt-for-young-children-and-boys", focus: "top" },
    },
    // 4. Satin Maxi Dress with Waist Tie · Enamel Tea Kettle, Classic Design · Baby Girls' Brown Floral Dress
    {
      tall: "round-neck-long-sleeve-satin-maxi-dress-waist",
      top: "enamel-tea-kettle-teakettle-porcelain-water-kettle-classic",
      bottom: { slug: "2026-new-spring-brown-long-sleeves-sister-clothes", focus: "top" },
    },
    // 5. Cotton Linen Buttoned Shirt Dress · Unisex Paris Hooded Sweatshirt · Toddler Girls Plaid Jumper with Turtleneck
    {
      tall: "2026-spring-summer-elegant-cotton-linen-blend-buttoned",
      top: { slug: "baby-boy-casual-letter-print-embossed-sweatshirt-green", focus: "top" },
      bottom: { slug: "toddler-girls-2-piece-outfit-set-new-2025", focus: "top" },
    },
  ],
};

export interface HeroPhoto {
  product: Product;
  focus: HeroPhotoFocus;
}

const HERO_TIME_ZONE = "America/New_York";
const DAY_MS = 86_400_000;

/** Today's date in New York (year, month 1–12, day). */
function newYorkDate(now: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: HERO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: "year" | "month" | "day") => Number(parts.find((p) => p.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day") };
}

const dayNumber = (year: number, month: number, day: number) => Math.round(Date.UTC(year, month - 1, day) / DAY_MS);

/** The season showing on `now` (New York date). */
export function heroSeason(now: Date = new Date()): HeroSeason {
  return SEASON_OF_MONTH[newYorkDate(now).month] ?? "winter";
}

/**
 * The current season's sets and which one is showing on `now`: set 1 on the
 * season's first day, the next set every HERO_ROTATION_DAYS days (at New York
 * midnight), wrapping around within the season.
 */
export function heroRotationFor(now: Date = new Date()): { season: HeroSeason; sets: HeroSet[]; index: number } {
  const { year, month, day } = newYorkDate(now);
  const season = SEASON_OF_MONTH[month] ?? "winter";
  // Walk back to the first month of this run of the season (e.g. Nov 1 for a February date).
  let startYear = year;
  let startMonth = month;
  for (let steps = 0; steps < 11; steps += 1) {
    const prevMonth = startMonth === 1 ? 12 : startMonth - 1;
    if (SEASON_OF_MONTH[prevMonth] !== season) break;
    if (prevMonth === 12) startYear -= 1;
    startMonth = prevMonth;
  }
  const sets = HERO_SEASONS[season].length > 0 ? HERO_SEASONS[season] : HERO_SEASONS.winter;
  const count = sets.length;
  if (count === 0) return { season, sets, index: 0 };
  const slot = Math.floor((dayNumber(year, month, day) - dayNumber(startYear, startMonth, 1)) / HERO_ROTATION_DAYS);
  return { season, sets, index: ((slot % count) + count) % count };
}

export function heroPickSlug(pick: HeroPhotoPick): string {
  return typeof pick === "string" ? pick : pick.slug;
}

export function heroPickFocus(pick: HeroPhotoPick): HeroPhotoFocus {
  return typeof pick === "string" ? "center" : pick.focus;
}
