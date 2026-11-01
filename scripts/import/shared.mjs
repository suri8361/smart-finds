// Shared helpers for the Smart Finds link importer (no dependencies — plain Node 18+).

/** The 27 product categories (keep in sync with ProductCategoryType in types/catalog.ts). */
export const CATEGORIES = [
  "dresses", "skirts", "tops", "sweaters", "cardigans", "sets", "jumpsuits", "pajamas", "coats-jackets",
  "shoes", "boots", "sandals", "sneakers", "bags", "accessories", "shabbos-elegant", "beauty", "home", "kitchen",
  "organization", "toys", "baby-gear", "school", "electronics", "outdoor", "camping", "other",
];

export const AUDIENCES = [
  "women", "men", "girls", "boys", "toddler-girl", "toddler-boy", "baby-girl", "baby-boy", "unisex-kids", "unisex-adult",
];

export const OCCASIONS = ["weekday", "shabbos", "both"];

export const LABELS = [
  "personally_tried", "chosen_for_look", "popular_pick", "highly_rated", "community_requested", "great_price", "trending_find",
];

/**
 * Keyword → category guesses, checked in order (more specific first). Matched
 * as whole words against the product title (and URL words when there's no
 * title). Only a guess — Sara reviews every row.
 */
const CATEGORY_KEYWORDS = [
  ["pajamas", ["pajama", "pajamas", "pyjama", "pyjamas", "pj", "pjs", "sleepwear", "nightgown", "nightdress", "robe", "loungewear"]],
  ["jumpsuits", ["jumpsuit", "jumpsuits", "romper", "rompers", "overalls", "onesie", "onesies", "coveralls"]],
  ["sets", ["2 piece", "two piece", "2pcs", "3pcs", "outfit set", "co ord", "coord", "matching set", "tracksuit"]],
  ["cardigans", ["cardigan", "cardigans"]],
  ["sweaters", ["sweater", "sweaters", "pullover", "jumper", "knit top", "sweatshirt", "sweatshirts", "hoodie", "hoodies", "knit", "knitted", "turtleneck"]],
  ["coats-jackets", ["coat", "coats", "jacket", "jackets", "blazer", "parka", "puffer", "vest", "trench", "windbreaker"]],
  ["dresses", ["dress", "dresses", "gown", "maxi dress", "midi dress", "sweater dress", "shirt dress", "slip dress", "knit dress", "t shirt dress", "hoodie dress"]],
  ["skirts", ["skirt", "skirts"]],
  ["boots", ["boot", "boots", "booties", "bootie"]],
  ["sandals", ["sandal", "sandals", "slides", "flip flops", "flip flop", "slippers", "slipper"]],
  ["sneakers", ["sneaker", "sneakers", "trainers", "running shoes", "tennis shoes", "running shoe"]],
  ["shoes", ["shoe", "shoes", "heels", "pumps", "flats", "loafers", "loafer", "mules", "oxfords", "clogs"]],
  ["bags", ["bag", "bags", "handbag", "purse", "tote", "backpack", "crossbody", "clutch", "wallet", "diaper bag"]],
  ["tops", ["top", "tops", "blouse", "shirt", "shirts", "tee", "t shirt", "tshirt", "tunic", "camisole", "cami", "bodysuit", "shell"]],
  ["accessories", ["necklace", "earrings", "earring", "bracelet", "ring", "jewelry", "scarf", "snood", "headband", "hat", "beanie", "belt", "sunglasses", "watch", "hair clip", "claw clip", "wig", "headscarf", "tichel", "gloves", "socks", "tights", "leggings", "scrunchie", "scrunchies", "barrette", "ponytail", "hair ties", "hair tie", "head scarves", "head scarf", "bow", "bows"]],
  ["beauty", ["makeup", "lipstick", "lip gloss", "mascara", "eyeliner", "foundation", "concealer", "serum", "moisturizer", "skincare", "skin care", "nail", "nails", "perfume", "lotion", "shampoo", "conditioner", "hair dryer", "curling", "straightener", "brush", "facial", "face mask"]],
  ["baby-gear", ["baby", "infant", "newborn", "stroller", "car seat", "crib", "bassinet", "pacifier", "bottle", "bib", "teether", "diaper", "high chair", "carrier", "swaddle", "toddler"]],
  ["toys", ["toy", "toys", "lego", "doll", "dolls", "puzzle", "plush", "stuffed", "game", "playset", "blocks", "kids play"]],
  ["school", ["school", "notebook", "pencil", "pencils", "pens", "pen", "lunch box", "lunchbox", "binder", "stationery", "crayons", "markers", "backpack for school"]],
  ["kitchen", ["kitchen", "pan", "pot", "pots", "skillet", "knife", "knives", "cutting board", "blender", "air fryer", "mug", "cup", "cups", "plates", "bowl", "bowls", "utensil", "utensils", "spatula", "baking", "cookware", "kettle", "coffee", "tumbler", "water bottle", "food storage", "container"]],
  ["organization", ["organizer", "organizers", "storage", "bin", "bins", "basket", "baskets", "drawer", "shelf", "rack", "hanger", "hangers", "closet", "caddy"]],
  ["electronics", ["charger", "cable", "usb", "bluetooth", "earbuds", "headphones", "speaker", "phone case", "iphone", "android", "tablet", "ipad", "laptop", "power bank", "led", "camera", "smart watch", "smartwatch", "airpods", "wireless", "mp3", "mp3 player", "mp4 player"]],
  ["camping", ["camping", "tent", "sleeping bag", "lantern", "hiking", "hammock", "campfire"]],
  ["outdoor", ["outdoor", "garden", "patio", "pool", "beach", "umbrella", "bike", "picnic", "cooler"]],
  ["home", ["home", "decor", "pillow", "pillows", "blanket", "throw", "curtain", "curtains", "rug", "lamp", "candle", "vase", "frame", "bedding", "sheets", "towel", "towels", "mirror", "tablecloth", "wall art", "door sign", "doorplate", "door plate", "name sign"]],
];

function words(text) {
  return " " + String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() + " ";
}

/** Clothing, shoes, bags and accessories: what a title is when it names a garment. */
export const APPAREL_CATEGORIES = new Set([
  "dresses", "skirts", "tops", "sweaters", "cardigans", "sets", "jumpsuits", "pajamas", "coats-jackets",
  "shoes", "boots", "sandals", "sneakers", "bags", "accessories", "shabbos-elegant",
]);

/**
 * Phrases that describe WHERE or HOW clothing is worn, or a garment detail,
 * not what the item is. SHEIN/Temu titles are full of them ("casual vacation
 * home daily knit", "back to school dress", "lantern sleeve top", "outdoor
 * casual beanie"), and the plain keyword pass used to file those under Home,
 * School, Camping or Outdoor (Oct 2026 audit: 200+ misfiled). They are
 * removed before matching.
 */
const CONTEXT_PHRASES = [
  "vacation home", "home daily", "daily home", "home wear", "homewear", "home clothes", "homeclothes", "at home", "for home",
  "stay home", "home outfit", "house wear",
  "back to school", "school style", "school uniform", "for school", "school outfit", "school girl", "school boy", "high school",
  "college style", "preppy school", "office wear", "office lady", "commute",
  "outdoor casual", "indoor outdoor", "indoor and outdoor", "outdoor wear", "for outdoor", "outdoor sports",
  "lantern sleeve", "lantern sleeves", "umbrella hem", "umbrella skirt", "kitchen party", "garden party", "beach vacation", "camping style",
  "baby doll", "babydoll", "baby blue", "baby pink",
];

/** Garment details with no garment noun ("... peter pan collar bow decor"): still clothing, filed as tops when nothing better matches — never Home/School. */
const GARMENT_DETAILS = ["long sleeve", "short sleeve", "sleeveless", "crew neck", "round neck", "v neck", "mock neck", "collar", "puff sleeve", "ruffle trim", "drop shoulder"];

function stripContext(text) {
  let out = text;
  for (const phrase of CONTEXT_PHRASES) out = out.split(" " + phrase + " ").join(" ");
  return out;
}

/**
 * Best-guess category for a title (falls back to "other"). Two passes: if the
 * title names a garment, shoe, bag or accessory, only those categories can
 * win, so "home"/"school"/"outdoor"/"baby" inside a clothing title can't file
 * it under Home & Kitchen, Home Office or Baby Gear. Otherwise the longest
 * matching keyword wins across all categories.
 */
export function guessCategory(title, url = "") {
  const sources = [stripContext(words(title))];
  if (!title) {
    try {
      const u = new URL(url);
      sources.push(stripContext(words(decodeURIComponent(u.pathname))));
    } catch {
      // not a URL — ignore
    }
  }
  for (const text of sources) {
    if (text.trim() === "") continue;
    const apparel = bestMatch(text, (category) => APPAREL_CATEGORIES.has(category));
    if (apparel) return apparel;
    if (GARMENT_DETAILS.some((detail) => text.includes(" " + detail + " "))) return "tops";
    const any = bestMatch(text, () => true);
    if (any) return any;
  }
  return "other";
}

// The longest matching keyword wins ("water bottle" beats "bottle"); ties go to the earlier category.
function bestMatch(text, allowed) {
  let best = { category: "", length: 0 };
  for (const [category, keys] of CATEGORY_KEYWORDS) {
    if (!allowed(category)) continue;
    for (const key of keys) {
      if (key.length > best.length && text.includes(" " + key + " ")) best = { category, length: key.length };
    }
  }
  return best.category;
}

/** True when a title or caption names clothing/shoes/bags/accessories (after removing "vacation home"-style context words). */
export function looksLikeApparel(...texts) {
  return texts.some((t) => {
    if (!t) return false;
    const text = stripContext(words(t));
    return bestMatch(text, (category) => APPAREL_CATEGORIES.has(category)) !== "" || GARMENT_DETAILS.some((d) => text.includes(" " + d + " "));
  });
}

/** Sara's "Tried and True" / "Tried & True" / "Tried n True" in a caption. */
export const TRIED_TRUE = /tried\s*(?:and|&|n|'n'?|-n-)\s*true/i;

/** Caption without the "Tried and True" phrase (it becomes the Tried & True badge instead). */
export function stripTriedTrue(text) {
  let s = String(text || "").replace(new RegExp(TRIED_TRUE.source, "gi"), "");
  s = s
    .replace(/^[\s!.\-–:,]+/, "")
    .replace(/\s+([!.,])/g, "$1")
    .replace(/([.!])\s*[!.]+/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/^[\-–:,!.]\s*/, "");
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

const HOLIDAY_PATTERNS = [
  ["rosh-hashanah", /rosh\s*hash[ao]n[ao]h?|rosh\s*hashona|shana\s*tova/i],
  ["sukkos", /suk+[oa]?[st]\b|suc+[oa][st]\b|sukk?ah\b|succ?ah\b|sukka\b|suka\b|simch?as?\s*torah|simchat\s*torah|esrog|etrog|lulav/i],
  ["chanukah", /[ck]?h?an+uk+ah?\b|chanuka|hanuk+ah?|menorah|dreidel/i],
  ["purim", /purim|mishloach/i],
  ["pesach", /pesach|passover|\bseder\b/i],
  ["yom-tov", /yom\s*tov|yomtov|yuntif|yom\s*kippur|shavuos|chol\s*ha?moed|high holidays?/i],
];

/** Holiday tags from the caption (and the title, where it names the holiday). General "yom-tov" is dropped when a specific holiday is named. */
export function holidaysFor(caption, title = "") {
  const found = new Set();
  for (const [holiday, pattern] of HOLIDAY_PATTERNS) if (pattern.test(caption || "") || pattern.test(title || "")) found.add(holiday);
  if (found.size > 1) found.delete("yom-tov");
  return [...found];
}

const MATERNITY = /matern|pregnan|nursing|breastfeed|\bbump\b/i;

/** Maternity clothing: the caption or title says maternity / pregnancy / nursing. */
export function isMaternity(caption, title = "") {
  return MATERNITY.test(caption || "") || MATERNITY.test(title || "");
}

/** Strips store boilerplate from a page / preview title ("Amazon.com: X : Home & Kitchen" → "X"). */
export function cleanTitle(title) {
  return String(title || "")
    .replace(/\s+/g, " ")
    .replace(/^Amazon\.com\s*:\s*/i, "")
    .replace(/\s*:\s*(Amazon\.com|[A-Z][\w &,'-]{2,40})\s*$/i, (m) => (/amazon|home|kitchen|clothing|beauty|toys|baby|electronics|sports|office|tools|health|pet|patio|garden|shoes|jewelry|automotive|books/i.test(m) ? "" : m))
    .replace(/\s*[|\-–]\s*(SHEIN|Temu|AliExpress|Amazon)(\s+\w+)?\s*$/i, "")
    .trim();
}

/** Store display name from a URL's host, or "" when it isn't one of the four stores. */
export function storeFromUrl(url) {
  let host;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
  if (/(^|\.)amazon\.[a-z.]+$/.test(host) || /(^|\.)(amzn\.to|amzn\.com|amzn\.eu|a\.co|link\.amazon)$/.test(host)) return "Amazon";
  if (/(^|\.)temu\.(com|to)$/.test(host) || /(^|\.)temu\.[a-z.]+$/.test(host)) return "Temu";
  if (/(^|\.)shein\.[a-z.]+$/.test(host) || /(^|\.)sheinlink\.com$/.test(host)) return "SHEIN";
  if (/(^|\.)aliexpress\.[a-z.]+$/.test(host) || /(^|\.)ali\.ski$/.test(host)) return "AliExpress";
  return "";
}

/** Hosts whose links are redirects (short / tracking links) that should be resolved. */
export function isShortLink(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  const host = u.hostname.toLowerCase();
  if (/(^|\.)(amzn\.to|amzn\.eu|a\.co|link\.amazon|temu\.to|ali\.ski|sheinlink\.com)$/.test(host)) return true;
  if (/^(s\.click|a|star)\.aliexpress\.[a-z.]+$/.test(host)) return true;
  if (/^(onelink|api-shein|shein\.top)\b/.test(host) || /(^|\.)onelink\.shein\.com$/.test(host)) return true;
  if (/(^|\.)temu\.com$/.test(host) && /^\/(k|s)\//.test(u.pathname)) return true; // temu.com/k/xxxx share links
  if (/(^|\.)shein\.[a-z.]+$/.test(host) && /^\/(s|share)\//i.test(u.pathname)) return true;
  return false;
}

/**
 * A stable id for "the same product", so the same item posted twice (or once
 * as a short link and once as a full link) becomes one row.
 */
export function productKey(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    return url;
  }
  const host = u.hostname.toLowerCase();
  const path = decodeURIComponent(u.pathname);
  let m;
  if (/amazon\./.test(host) && (m = path.match(/\/(?:dp|gp\/product|gp\/aw\/d|d)\/([A-Z0-9]{10})/i))) return "amazon:" + m[1].toUpperCase();
  if (/aliexpress\./.test(host) && (m = path.match(/\/item\/(?:[^/]*?)(\d{6,})\.html/))) return "aliexpress:" + m[1];
  if (/shein\./.test(host) && (m = path.match(/-p-(\d+)(?:-cat-\d+)?\.html/))) return "shein:" + m[1];
  if (/temu\./.test(host)) {
    const gid = u.searchParams.get("goods_id");
    if (gid) return "temu:" + gid;
    if ((m = path.match(/-g-(\d{6,})\.html/))) return "temu:" + m[1];
  }
  return (host.replace(/^www\./, "") + path).replace(/\/+$/, "");
}

// ---------- CSV ----------

export function toCsv(rows, columns) {
  const esc = (value) => {
    const s = value === undefined || value === null ? "" : String(value);
    return /[",\r\n]/.test(s) || /^\s|\s$/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [columns.join(","), ...rows.map((row) => columns.map((c) => esc(row[c])).join(","))].join("\r\n") + "\r\n";
}

/** RFC 4180 CSV parser (quotes, commas and newlines inside quotes; strips a UTF-8 BOM). Returns objects keyed by header. */
export function parseCsv(text) {
  text = text.replace(/^\uFEFF/, "");
  // Excel in some locales saves with semicolons — detect from the header line.
  const firstLine = text.split(/\r?\n/, 1)[0];
  const sep = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === sep) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  const nonEmpty = rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  if (nonEmpty.length === 0) return [];
  const header = nonEmpty[0].map((h) => h.trim().toLowerCase());
  return nonEmpty.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? "").trim()])));
}

/**
 * Remove price mentions from a caption, keeping the rest of the words.
 * Amazon Associates rules don't allow showing a stored price, so Amazon
 * captions go through this before they reach the site ("Great Chanuka gift
 * $16.99" → "Great Chanuka gift"). Handles $16.99, $16, 16.99$, bare 16.99,
 * ranges ($14.99-$17.99) and the words that only exist to introduce a price
 * ("now only", "was", "from", "for", "under", "list price", ...).
 */
const MONEY = String.raw`(?:\$\s?\d[\d,]*(?:\.\d+)?|(?<![\w.$/-])\d[\d,]*(?:\.\d+)?\$(?!\d)|(?<![\w.$/-])\d{1,4}\.\d{2}(?![\d%.]|\s*(?:oz|lbs?|in|inch(?:es)?|cm|mm|ft|ml|l|kg|g|qt|"|'')\b))`;
const PRICE_QUALIFIER = String.raw`(?:now\s+only|now|was|starting\s+(?:at|from)|from|under|original(?:ly)?(?:\s+price)?|list\s+price|price\s+between|price|for)`;
const PRICE_RE = new RegExp(
  String.raw`(\s*[-–:]\s*)?` + // a dash/colon right before the price
    String.raw`(?:\b(?:only|${PRICE_QUALIFIER})\s+)*` + // words that only introduce the price
    `${MONEY}(?:\\s*(?:-|–|to)\\s*${MONEY})?` + // the price or a range
    String.raw`(?:\s+(?:depends on size|with applied coupon))?` +
    String.raw`(\s*[-–]+(?=\s|$))?`, // a dash right after it
  "gi"
);
// "only" stays when it's about sizes/colours ("SMALL ONLY $12.67", "some sizes only $7.49").
const KEEP_ONLY_BEFORE = /\b(sizes?|small|medium|large|x+l)\s*$/i;

export function stripPrices(text) {
  if (!text) return text;
  const original = String(text);
  let found = false;
  let out = original.replace(PRICE_RE, (match, dashBefore, dashAfter, offset, whole) => {
    found = true;
    const lead = match.match(/^\s*(?:[-–:]\s*)?(only)\b/i);
    const keep = lead && KEEP_ONLY_BEFORE.test(whole.slice(0, offset)) ? ` ${lead[1]}` : "";
    const before = whole.slice(0, offset).trim();
    const after = whole.slice(offset + match.length).trim();
    if ((dashBefore || dashAfter) && before && after && !/[.!?,]$/.test(before)) return `${keep} - `;
    // "12 Pairs $26.98 6 pairs $14.98" → "12 Pairs, 6 pairs"
    if (/[A-Za-z]$/.test(before) && /^\d/.test(after)) return `${keep}, `;
    return `${keep} `;
  });
  if (!found) return original; // no price: leave her words exactly as they were
  out = out
    .replace(/\(\s*\)/g, "")
    .replace(/\s+([,.!?;:)])/g, "$1")
    .replace(/([.!?])\s*[-–]+\s+/g, "$1 ")
    .replace(/,\s*([.!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,;:–-]+|[\s,;:–-]+$/g, "")
    .trim();
  return out;
}
