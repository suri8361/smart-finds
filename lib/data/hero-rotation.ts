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
 * TRIED & TRUE RULE (Sara, Nov 1 2026): every set in every season must
 * include at least one Tried & True find (recommendationLabel
 * "personally_tried"), in any spot, that fits the season. The "Tried & True"
 * badge shows on that photo whichever spot it's in. The build fails if a set
 * breaks this rule (lib/data/catalog.ts runs heroRuleProblems at build time),
 * and so does the data-branch tool (scripts/data/build-catalog.mjs).
 *
 * To change a season: edit, add or remove sets in its list (keep a portrait
 * photo for `tall`). If a product here is removed from the site, its spot is
 * filled automatically from the same spot in the next set of that season.
 *
 * WHERE THE LIVE SETS COME FROM (Nov 2026): the list below is the copy bundled
 * with each deploy. The live site uses hero.json on the `data` branch when it
 * has one (changing that needs NO deploy — see lib/config/data-source.ts and
 * the data branch README); this list is the fallback, so keep the two the same
 * whenever you change one.
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
  // Every set has at least one Tried & True find (T&T) that fits winter.
  winter: [
    // 1. girls' plaid suspender skirt outfit (T&T) · grey crystal-flower sweater · white faux fur throw
    {
      tall: "shein-1pc-young-girl-cute-retro-casual-plaid",
      top: { slug: "anewsta-handmade-crystal-velvet-commuter-christmas-round-neck", focus: "top" },
      bottom: { slug: "bedsure-fluffy-bubble-faux-fur-throw-blanket-50", focus: "top" },
    },
    // 2. black sweater & tweed skirt · leopard-sleeve striped sweatshirt (T&T) · boys' wool coats
    {
      tall: "mobula-sound-spring-autumn-versatile-fashion-tweed-button",
      top: { slug: "emery-rose-women-s-black-leopard-print-striped", focus: "bottom" },
      bottom: { slug: "winter-woolen-jacket-for-boy-new-2024-korean", focus: "top" },
    },
    // 3. stand collar maxi dress · girls' grey knit collar cardigan (T&T) · girls' plaid pinafore
    {
      tall: "anewsta-autumn-winter-new-fashion-elegant-stand-collar",
      top: { slug: "tween-girl-knitted-embroidered-collar-button-up-cardigan", focus: "center" },
      bottom: { slug: "girls-korean-style-academy-retro-plaid-outfit-vintage", focus: "top" },
    },
    // 4. brown satin shirt dress · over-the-knee boots (T&T) · girls' velvet Shabbos sets
    {
      tall: "balvessa-women-s-elegant-commute-shirt-and-skirt",
      top: { slug: "women-comfortable-high-stretch-over-the-knee-boots", focus: "center" },
      bottom: { slug: "bloom-kids-velvet-shabbos-2-piece-set-for", focus: "top" },
    },
    // 5. knit cardigan & long skirt · leopard-sleeve raglan sweatshirt (T&T) · kids' down coats
    {
      tall: "knit-sweaters-cropped-cardigan-woman-knitwear-fashion-casual",
      top: { slug: "wildy-boho-summer-to-fall-leopard-print-round", focus: "top" },
      bottom: { slug: "ap-2025-winter-design-waterproof-fabric-children-down", focus: "top" },
    },
    // 6. burgundy maternity dress · girls' cream knit cardigan (T&T) · baby velvet overcoat
    {
      tall: "shein-maternity-casual-maternity-solid-color-turndown-collar",
      top: { slug: "tween-girl-knit-cardigan-with-embroidered-floral-trim", focus: "center" },
      bottom: { slug: "souflis-french-vintage-autumn-winter-new-thickened-long", focus: "top" },
    },
    // 7. black velvet & satin gown · reversible cotton duvet & sheet set · girls' black patterned tights (T&T)
    {
      tall: "women-s-round-neck-long-sleeve-paneled-maxi",
      top: "reversible-cotton-duvet-and-sheet-set",
      bottom: { slug: "1pair-girls-solid-casual-fishnet-tights-for-daily", focus: "center" },
    },
    // 8. lantern sleeve satin dress · knit pullover in the snow · boys' navy sailboat sweatshirt (T&T)
    {
      tall: "lilora-solid-lantern-sleeve-satin-dress",
      top: { slug: "firerie-plus-size-women-solid-color-crew-neck", focus: "top" },
      bottom: { slug: "boys-lined-crew-neck-sweatshirt-with-cute-cartoon", focus: "center" },
    },
    // 9. velvet dress set · kids' leather snow boots · baby grey knit suspender leggings (T&T)
    {
      tall: "as-2024-fall-winter-velvet-woman-clothes-adjustable",
      top: "2025-new-winter-baby-snow-boots-leather-warm",
      bottom: { slug: "infant-baby-girl-boy-suspender-leggings-high-waist", focus: "center" },
    },
    // 10. embroidered sweater & skirt · grey beaded cardigan · girls' black cherry-print hoodie (T&T)
    {
      tall: "as-aw26-trendy-woman-teen-clothes-embroidered-crewneck",
      top: { slug: "anewsta-gray-french-design-beaded-decoration-knit-cardigan", focus: "top" },
      bottom: { slug: "girls-watercolor-cherry-and-bow-back-print-pullover", focus: "center" },
    },
    // 11. grey Peter Pan collar coat · wool-blend rhinestone sweater · baby boy's black bear sweatshirt (T&T)
    {
      tall: "allegra-k-womens-peter-pan-collar-overcoat-single",
      top: { slug: "anewsta-autumn-winter-elegant-wool-blend-solid-color", focus: "top" },
      bottom: { slug: "shein-cute-bear-baby-boy-casual-minimalist-cartoon", focus: "center" },
    },
    // 12. navy shirt dress · toddler's quilted bomber jacket (T&T) · girl's contrast collar jacket
    {
      tall: "2026-spring-summer-elegant-cotton-linen-blend-buttoned",
      top: { slug: "shein-baby-boy-girl-zip-up-quilted-bomber", focus: "top" },
      bottom: { slug: "elladie-kids-1pc-young-girl-comfortable-casual-elegant", focus: "top" },
    },
    // 13. brown long sleeve dress · girls' cream knit cardigan (T&T) · baby boy's quilted hoodie
    {
      tall: "long-sleeve-plaid-dress",
      top: { slug: "tween-girl-knit-cardigan-with-embroidered-floral-trim", focus: "center" },
      bottom: { slug: "cozy-pixies-baby-boy-army-green-hooded-sweatshirt", focus: "top" },
    },
  ],

  // SPRING (Mar–Apr): light dresses, soft colors, Pesach table. Every set has one T&T find.
  spring: [
    // 1. embroidered lace dress · pink striped puff sleeve blouse (T&T) · baby girl heart pinafore
    {
      tall: "anewsta-embroidered-lace-trim-spring-summer-elegant-modern",
      top: { slug: "vixey-self-tie-back-collared-button-up-puff", focus: "top" },
      bottom: "shein-babygirl-pink-cute-heart-pattern-pinafore-dress",
    },
    // 2. magenta shirt dress · crochet lace tablecloth · pull-back car set with play mat (T&T)
    {
      tall: "anewsta-women-s-new-fashionable-elegant-valentine-s",
      top: "crochet-lace-tablecloth",
      bottom: "pull-back-car-set-with-play-mat",
    },
    // 3. floral polka dot dress · girls' denim maxi skirt (T&T) · girls' duck hoodie
    {
      tall: "anewsta-spring-summer-new-arrival-elegant-vacation-style",
      top: { slug: "girl-s-casual-minimalist-front-button-a-line", focus: "center" },
      bottom: { slug: "little-girls-hooded-sweatshirt-tween-girls-graphic-print", focus: "top" },
    },
    // 4. white belted puff sleeve gown (T&T) · magnetic building blocks · girls' apricot floral dress
    {
      tall: "solid-color-printed-waist-belt-decor-v-neck",
      top: "kids-magnetic-building-blocks-3-year-olds-and",
      bottom: { slug: "tween-girls-waist-girls-apricot-floral-print-long", focus: "top" },
    },
    // 5. floral organza dress · turquoise enamel heart earrings (T&T) · baby romper & girl's dress
    {
      tall: "anewsta-elegant-waist-cinched-full-skirt-colorful-spring",
      top: { slug: "stylish-and-versatile-enamel-heart-s925-sterling-silver", focus: "top" },
      bottom: { slug: "2026-new-children-clothes-spring-long-sleeved-cotton", focus: "top" },
    },
  ],

  // SUMMER (May–Aug): light fabrics and puff sleeves (still modest: no sleeveless). Every set has one T&T find.
  summer: [
    // 1. embroidered puff sleeve set · blue striped shirt (T&T) · girls' apricot floral dress
    {
      tall: "anewsta-elegant-women-s-commuting-minimalist-summer-embroidered",
      top: { slug: "resyla-blue-striped-loose-short-sleeve-shirt-new", focus: "center" },
      bottom: { slug: "tween-girls-waist-girls-apricot-floral-print-long", focus: "top" },
    },
    // 2. maternity floral dress · pink striped puff sleeve blouse (T&T) · baby romper & girl's dress
    {
      tall: "shein-pregnant-women-summer-elegant-wedding-style-all",
      top: { slug: "vixey-self-tie-back-collared-button-up-puff", focus: "top" },
      bottom: { slug: "2026-new-children-clothes-spring-long-sleeved-cotton", focus: "top" },
    },
    // 3. off-white pintuck gown · turquoise enamel heart earrings (T&T) · girls' ditsy floral blouse
    {
      tall: "enchnt-off-white-summer-elegant-wedding-guest-women",
      top: { slug: "stylish-and-versatile-enamel-heart-s925-sterling-silver", focus: "top" },
      bottom: { slug: "loomiva-young-girl-ditsy-floral-peter-pan-collar", focus: "top" },
    },
    // 4. white belted puff sleeve gown (T&T) · LED balloons · baby girls' embroidered dresses
    {
      tall: "solid-color-printed-waist-belt-decor-v-neck",
      top: "balloons-10-strings-of-balloons-with-led-luminous",
      bottom: { slug: "autumn-sisters-dress-baby-bodysuit-flower-embroidery-dress", focus: "top" },
    },
    // 5. colorblock maxi shirt dress · girls' denim maxi skirt (T&T) · wooden play kitchen
    {
      tall: "aveloria-modichic-spring-summer-black-white-yellow-red",
      top: { slug: "girl-s-casual-minimalist-front-button-a-line", focus: "center" },
      bottom: "best-choice-products-kids-wooden-cottage-play-kitchen",
    },
  ],

  // FALL (Sep–Oct): browns and rust, Yom Tov table, early sweaters. Every set has one T&T find.
  fall: [
    // 1. leopard-sleeve raglan sweatshirt (T&T) · pomegranate placemats · girl's maple leaf sweatshirt
    {
      tall: "wildy-boho-summer-to-fall-leopard-print-round",
      top: "judaica-table-dinner-pomegranate-placemat-for-rosh-hashanah",
      bottom: { slug: "colorful-autumn-maple-leaf-print-crewneck-thin-sweatshirt", focus: "top" },
    },
    // 2. embroidered sweater & skirt · leopard-sleeve striped sweatshirt (T&T) · girls' corduroy leopard dresses
    {
      tall: "as-aw26-trendy-woman-teen-clothes-embroidered-crewneck",
      top: { slug: "emery-rose-women-s-black-leopard-print-striped", focus: "bottom" },
      bottom: { slug: "1pc-spring-autumn-young-girl-stylish-dress-corduroy", focus: "top" },
    },
    // 3. printed maxi dress · girls' grey knit collar cardigan (T&T) · boy's tractor sweatshirt
    {
      tall: "solivie-women-s-autumn-vintage-romantic-bohemian-dress",
      top: { slug: "tween-girl-knitted-embroidered-collar-button-up-cardigan", focus: "center" },
      bottom: { slug: "autumn-sports-shirt-for-young-children-and-boys", focus: "top" },
    },
    // 4. brown satin maxi dress · girls' cream knit cardigan (T&T) · girls' brown floral dresses
    {
      tall: "round-neck-long-sleeve-satin-maxi-dress-waist",
      top: { slug: "tween-girl-knit-cardigan-with-embroidered-floral-trim", focus: "center" },
      bottom: { slug: "2026-new-spring-brown-long-sleeves-sister-clothes", focus: "top" },
    },
    // 5. navy shirt dress · toddler's quilted bomber jacket (T&T) · toddler plaid jumper & turtleneck
    {
      tall: "2026-spring-summer-elegant-cotton-linen-blend-buttoned",
      top: { slug: "shein-baby-boy-girl-zip-up-quilted-bomber", focus: "top" },
      bottom: { slug: "toddler-girls-2-piece-outfit-set-new-2025", focus: "top" },
    },
  ],
};

/** The sets in use right now: the data branch's hero.json when the site has read it, else HERO_SEASONS above. */
let liveHeroSeasons: Record<HeroSeason, HeroSet[]> = HERO_SEASONS;

/** Swap in hero sets read from the data branch. Called by lib/data/catalog.ts only (after heroRuleProblems passed). */
export function setLiveHeroSeasons(next: Record<HeroSeason, HeroSet[]>): void {
  liveHeroSeasons = next;
}

export const HERO_SEASON_NAMES: HeroSeason[] = ["winter", "spring", "summer", "fall"];

/**
 * Problems with a set of hero lists, as plain sentences (empty = all good):
 * every season needs at least one set, every spot a product that is on the
 * site with a photo, and every set at least one Tried & True find.
 */
export function heroRuleProblems(
  seasons: Record<HeroSeason, HeroSet[]>,
  findProduct: (slug: string) => Product | undefined
): string[] {
  const problems: string[] = [];
  for (const season of HERO_SEASON_NAMES) {
    const sets = seasons?.[season];
    if (!Array.isArray(sets) || sets.length === 0) {
      problems.push(`${season}: no sets`);
      continue;
    }
    sets.forEach((set, index) => {
      let tried = 0;
      for (const spot of ["tall", "top", "bottom"] as const) {
        const pick = set?.[spot];
        const slug = pick ? heroPickSlug(pick) : "";
        const product = slug ? findProduct(slug) : undefined;
        if (!product) problems.push(`${season} set ${index + 1} ${spot}: "${slug}" is not on the site`);
        else if (!product.image) problems.push(`${season} set ${index + 1} ${spot}: "${slug}" has no photo`);
        if (product?.recommendationLabel === "personally_tried") tried += 1;
      }
      if (tried === 0) problems.push(`${season} set ${index + 1}: no Tried & True find`);
    });
  }
  return problems;
}

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
  const sets = liveHeroSeasons[season]?.length > 0 ? liveHeroSeasons[season] : liveHeroSeasons.winter;
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
