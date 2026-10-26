// Shared helpers for the Smart Finds link importer (no dependencies — plain Node 18+).

/** The 26 product categories (keep in sync with ProductCategoryType in types/catalog.ts). */
export const CATEGORIES = [
  "dresses", "skirts", "tops", "sweaters", "cardigans", "sets", "jumpsuits", "pajamas", "coats-jackets",
  "shoes", "boots", "sandals", "sneakers", "bags", "accessories", "beauty", "home", "kitchen",
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
  ["jumpsuits", ["jumpsuit", "jumpsuits", "romper", "rompers", "overalls", "onesie"]],
  ["sets", ["2 piece", "two piece", "2pcs", "3pcs", "outfit set", "co ord", "coord", "matching set", "tracksuit"]],
  ["cardigans", ["cardigan", "cardigans"]],
  ["sweaters", ["sweater", "sweaters", "pullover", "jumper", "knit top", "sweatshirt", "hoodie"]],
  ["coats-jackets", ["coat", "coats", "jacket", "jackets", "blazer", "parka", "puffer", "vest", "trench", "windbreaker"]],
  ["dresses", ["dress", "dresses", "gown", "maxi dress", "midi dress", "sweater dress", "shirt dress", "slip dress", "knit dress", "t shirt dress", "hoodie dress"]],
  ["skirts", ["skirt", "skirts"]],
  ["boots", ["boot", "boots", "booties", "bootie"]],
  ["sandals", ["sandal", "sandals", "slides", "flip flops", "flip flop", "slippers", "slipper"]],
  ["sneakers", ["sneaker", "sneakers", "trainers", "running shoes", "tennis shoes", "running shoe"]],
  ["shoes", ["shoe", "shoes", "heels", "pumps", "flats", "loafers", "loafer", "mules", "oxfords", "clogs"]],
  ["bags", ["bag", "bags", "handbag", "purse", "tote", "backpack", "crossbody", "clutch", "wallet", "diaper bag"]],
  ["tops", ["top", "tops", "blouse", "shirt", "shirts", "tee", "t shirt", "tshirt", "tunic", "camisole", "cami", "bodysuit", "shell"]],
  ["accessories", ["necklace", "earrings", "earring", "bracelet", "ring", "jewelry", "scarf", "snood", "headband", "hat", "beanie", "belt", "sunglasses", "watch", "hair clip", "claw clip", "wig", "headscarf", "tichel", "gloves"]],
  ["beauty", ["makeup", "lipstick", "lip gloss", "mascara", "eyeliner", "foundation", "concealer", "serum", "moisturizer", "skincare", "skin care", "nail", "nails", "perfume", "lotion", "shampoo", "conditioner", "hair dryer", "curling", "straightener", "brush", "facial", "face mask"]],
  ["baby-gear", ["baby", "infant", "newborn", "stroller", "car seat", "crib", "bassinet", "pacifier", "bottle", "bib", "teether", "diaper", "high chair", "carrier", "swaddle", "toddler"]],
  ["toys", ["toy", "toys", "lego", "doll", "dolls", "puzzle", "plush", "stuffed", "game", "playset", "blocks", "kids play"]],
  ["school", ["school", "notebook", "pencil", "pencils", "pens", "pen", "lunch box", "lunchbox", "binder", "stationery", "crayons", "markers", "backpack for school"]],
  ["kitchen", ["kitchen", "pan", "pot", "pots", "skillet", "knife", "knives", "cutting board", "blender", "air fryer", "mug", "cup", "cups", "plates", "bowl", "bowls", "utensil", "utensils", "spatula", "baking", "cookware", "kettle", "coffee", "tumbler", "water bottle", "food storage", "container"]],
  ["organization", ["organizer", "organizers", "storage", "bin", "bins", "basket", "baskets", "drawer", "shelf", "rack", "hanger", "hangers", "closet", "caddy"]],
  ["electronics", ["charger", "cable", "usb", "bluetooth", "earbuds", "headphones", "speaker", "phone case", "iphone", "android", "tablet", "ipad", "laptop", "power bank", "led", "camera", "smart watch", "smartwatch", "airpods", "wireless"]],
  ["camping", ["camping", "tent", "sleeping bag", "lantern", "hiking", "hammock", "campfire"]],
  ["outdoor", ["outdoor", "garden", "patio", "pool", "beach", "umbrella", "bike", "picnic", "cooler"]],
  ["home", ["home", "decor", "pillow", "pillows", "blanket", "throw", "curtain", "curtains", "rug", "lamp", "candle", "vase", "frame", "bedding", "sheets", "towel", "towels", "mirror", "tablecloth", "wall art"]],
];

function words(text) {
  return " " + String(text || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim() + " ";
}

/** Best-guess category for a title (falls back to "other"). */
export function guessCategory(title, url = "") {
  const sources = [words(title)];
  if (!title) {
    try {
      const u = new URL(url);
      sources.push(words(decodeURIComponent(u.pathname)));
    } catch {
      // not a URL — ignore
    }
  }
  // The longest matching keyword wins ("water bottle" beats "bottle"); ties go to the earlier category.
  let best = { category: "other", length: 0 };
  for (const text of sources) {
    if (text.trim() === "") continue;
    for (const [category, keys] of CATEGORY_KEYWORDS) {
      for (const key of keys) {
        if (key.length > best.length && text.includes(" " + key + " ")) best = { category, length: key.length };
      }
    }
    if (best.length) return best.category;
  }
  return "other";
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
  if (/(^|\.)amazon\.[a-z.]+$/.test(host) || /(^|\.)(amzn\.to|amzn\.com|amzn\.eu|a\.co)$/.test(host)) return "Amazon";
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
  if (/(^|\.)(amzn\.to|amzn\.eu|a\.co|temu\.to|ali\.ski|sheinlink\.com)$/.test(host)) return true;
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
