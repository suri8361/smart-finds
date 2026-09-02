/**
 * Server-only, best-effort product-page scraper for the /admin/add-product
 * dev tool. Deliberately dependency-free (regex-based extraction instead of
 * a full HTML parser) — this only needs to read a handful of well-known
 * signals (Open Graph / Twitter meta tags, schema.org JSON-LD, embedded
 * JSON/hydration data, server-rendered tables), not build a general-purpose
 * DOM.
 *
 * This is NOT a robust scraper, and deliberately can't become one: it never
 * executes JavaScript, solves a CAPTCHA, or spins up a real browser. Many
 * storefronts (SHEIN especially) render price/variant/size data client-side
 * and/or sit behind bot-detection that blocks a plain server-side fetch —
 * confirmed directly against SHEIN's live site, canonical product URLs
 * (e.g. https://us.shein.com/<name>-p-<id>.html) currently 302 to
 * `/risk/challenge?captcha_type=...`, a CAPTCHA wall, for a plain fetch.
 * When that happens this degrades gracefully: whatever *is* found (often at
 * least the title and images, since those are usually server-rendered for
 * SEO/social previews on pages that aren't challenged) gets returned, and
 * the caller always still gets a `data` object with the URL-derived store
 * name so the importer's form is never blocked. See `sizeImportStatus` for
 * a caller-facing signal of exactly what happened with sizing specifically.
 */

import type { SizeImportStatus, SizeMeasurementInput } from "@/lib/admin/generateProductCode";
import {
  buildMeasurementsForRow,
  canonicalMeasurementKey,
  detectUnitFromHeaderText,
  detectUnitFromJsonKey,
  groupColumnsByKey,
  mergeUnitPairs,
  SIZE_COLUMN_HINT,
  SIZE_LABEL_KEY_HINT,
  type MeasurementColumn,
} from "@/lib/admin/measurementKeys";

export interface ScrapedProductData {
  title?: string;
  description?: string;
  currentPrice?: number;
  originalPrice?: number;
  currency?: string;
  images: string[];
  store: string;
  /** Best-effort, from whichever extraction strategy found something first (schema.org JSON-LD → embedded/hydration JSON → server-rendered table). Never fabricated — absent when nothing genuine was found. */
  sizeMeasurements?: SizeMeasurementInput[];
  /** Basic size labels (e.g. ["S","M","L"]) — derived from `sizeMeasurements` when present, otherwise a best-effort scan for a plain size-list in the page's embedded data. */
  sizes?: string[];
  /** Machine-readable summary of what happened with sizing specifically, for surfacing a message like "Size chart imported from SHEIN" in the importer UI. */
  sizeImportStatus: SizeImportStatus;
  sizeImportMessage: string;
}

export interface ScrapeResult {
  success: boolean;
  data?: ScrapedProductData;
  error?: string;
  warnings?: string[];
}

const KNOWN_STORES: Record<string, string> = {
  "shein.com": "SHEIN",
  "aliexpress.com": "AliExpress",
  "aliexpress.us": "AliExpress",
  "temu.com": "Temu",
  "ebay.com": "eBay",
  "amazon.com": "Amazon",
  "walmart.com": "Walmart",
  "etsy.com": "Etsy",
};

/** Derives a display store name from a hostname, e.g. "us.shein.com" -> "SHEIN". Pure/client-safe — also used by the importer form as a fallback when the fetch itself fails. */
export function deriveStoreName(hostname: string): string {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  for (const [domain, name] of Object.entries(KNOWN_STORES)) {
    if (host === domain || host.endsWith(`.${domain}`)) return name;
  }
  const parts = host.split(".");
  const primary = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  return primary ? primary.charAt(0).toUpperCase() + primary.slice(1) : host;
}

// Blocks obvious loopback/private/link-local targets so this dev-only fetch
// proxy can't be pointed at internal infrastructure (basic SSRF hardening).
// Hostname-pattern based, not a DNS-resolution check — good enough for a
// local dev tool, not a substitute for real network-level controls.
const BLOCKED_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^\[?::1\]?$/,
  /^\[?fc[0-9a-f]{2}:/i,
  /^\[?fe80:/i,
];

function isBlockedHostname(hostname: string): boolean {
  return BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname));
}

// Signals that the response is an anti-bot/CAPTCHA challenge page rather
// than the real product page — never something this scraper tries to get
// past (no solving, no browser automation, no stealth headers), just
// something worth detecting so the UI can say so plainly instead of
// reporting a confusing "couldn't find a title/price" for a page that was
// never going to have one. The `/risk/challenge` + `captcha_type=` pattern
// is SHEIN's own, confirmed live; the rest are other common vendors' known
// challenge-page fingerprints, checked as a general fallback.
function isBotChallengeResponse(finalUrl: string, html: string): boolean {
  if (/\/risk\/challenge\b/i.test(finalUrl) || /[?&]captcha_type=/i.test(finalUrl)) return true;
  const sample = html.slice(0, 20000);
  return [
    /id=["']px-captcha["']/i,
    /datadome/i,
    /Access to this page has been denied/i,
    /Checking your browser before accessing/i,
    /Please verify you are a human/i,
    /needs to review the security of your connection/i,
    /cf-chl-widget/i,
  ].some((pattern) => pattern.test(sample));
}

export async function scrapeProductFromUrl(rawUrl: string): Promise<ScrapeResult> {
  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return { success: false, error: "That doesn't look like a valid URL." };
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return { success: false, error: "Only http and https URLs are supported." };
  }

  if (isBlockedHostname(target.hostname)) {
    return { success: false, error: "This host can't be fetched by the importer." };
  }

  const store = deriveStoreName(target.hostname);

  let html: string;
  let finalUrl: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response: Response;
    try {
      response = await fetch(target.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return {
        success: false,
        error: `The site responded with status ${response.status}. It may be blocking automated requests — you can still fill in the product details manually below.`,
        data: {
          images: [],
          store,
          sizeImportStatus: "not_available",
          sizeImportMessage: `${store} did not expose size measurements — enter them manually.`,
        },
      };
    }
    html = await response.text();
    finalUrl = response.url || target.toString();
  } catch {
    return {
      success: false,
      error:
        "Couldn't reach that URL — it may be blocking automated requests, or the request timed out. You can still fill in the details manually below.",
      data: {
        images: [],
        store,
        sizeImportStatus: "not_available",
        sizeImportMessage: `${store} did not expose size measurements — enter them manually.`,
      },
    };
  }

  const blocked = isBotChallengeResponse(finalUrl, html);
  const extracted = blocked
    ? { title: undefined, description: undefined, currentPrice: undefined, originalPrice: undefined, currency: undefined, images: [], sizeMeasurements: undefined, sizes: undefined }
    : extractFromHtml(html, target);

  const { status: sizeImportStatus, message: sizeImportMessage } = classifySizeImport({
    store,
    blocked,
    sizeMeasurements: extracted.sizeMeasurements,
    sizes: extracted.sizes,
  });

  const warnings: string[] = [];
  if (blocked) {
    warnings.push(
      `${store} blocked this request with a bot-protection/CAPTCHA challenge — none of the product details could be retrieved automatically. Enter everything manually below.`
    );
  } else {
    if (!extracted.title) warnings.push("Couldn't detect a product title — enter one manually.");
    if (extracted.currentPrice === undefined) warnings.push("Couldn't detect a price — enter one manually.");
    if (extracted.images.length === 0) warnings.push("Couldn't detect any images on the page.");
  }
  warnings.push(sizeImportMessage);

  return {
    success: true,
    data: { ...extracted, store, sizeImportStatus, sizeImportMessage },
    warnings,
  };
}

function classifySizeImport(params: {
  store: string;
  blocked: boolean;
  sizeMeasurements: SizeMeasurementInput[] | undefined;
  sizes: string[] | undefined;
}): { status: ScrapedProductData["sizeImportStatus"]; message: string } {
  const { store, blocked, sizeMeasurements, sizes } = params;
  const retailer = store || "the retailer";

  if (blocked) {
    return {
      status: "blocked",
      message: `${retailer} blocked this request (bot/CAPTCHA protection) — enter sizes and measurements manually.`,
    };
  }
  if (sizeMeasurements && sizeMeasurements.length > 0) {
    return { status: "measurements", message: `Size chart imported from ${retailer}.` };
  }
  if (sizes && sizes.length > 0) {
    return { status: "sizes_only", message: "Sizes found, but detailed measurements were not available." };
  }
  return {
    status: "not_available",
    message: `${retailer} did not expose size measurements — enter them manually.`,
  };
}

// ---------------------------------------------------------------------------
// HTML extraction helpers
// ---------------------------------------------------------------------------

interface MetaTag {
  key: string;
  value: string;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function collectMetaTags(html: string): MetaTag[] {
  const tags: MetaTag[] = [];
  const metaTagRegex = /<meta\b[^>]*>/gi;
  const attrRegex = /([a-zA-Z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  const rawTags = html.match(metaTagRegex) || [];

  for (const raw of rawTags) {
    const attrs: Record<string, string> = {};
    attrRegex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = attrRegex.exec(raw))) {
      attrs[match[1].toLowerCase()] = (match[2] !== undefined ? match[2] : match[3]) ?? "";
    }
    const key = (attrs.property || attrs.name || attrs.itemprop || "").toLowerCase();
    if (key && attrs.content !== undefined) {
      tags.push({ key, value: decodeHtmlEntities(attrs.content) });
    }
  }
  return tags;
}

function firstMetaValue(tags: MetaTag[], key: string): string | undefined {
  return tags.find((tag) => tag.key === key)?.value;
}

function allMetaValues(tags: MetaTag[], key: string): string[] {
  return tags.filter((tag) => tag.key === key).map((tag) => tag.value);
}

function extractTitleTag(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeHtmlEntities(match[1]) : undefined;
}

function cleanText(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const trimmed = text.replace(/\s+/g, " ").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

interface JsonLdProduct {
  name?: string;
  description?: string;
  images: string[];
  price?: number;
  currency?: string;
  sizeMeasurements?: SizeMeasurementInput[];
}

function extractImageUrl(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof (value as { url?: unknown }).url === "string") {
    return (value as { url: string }).url;
  }
  return undefined;
}

function flattenJsonLd(node: unknown): Record<string, unknown>[] {
  if (Array.isArray(node)) return node.flatMap(flattenJsonLd);
  if (node && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const graph = Array.isArray(obj["@graph"]) ? (obj["@graph"] as unknown[]).flatMap(flattenJsonLd) : [];
    return [obj, ...graph];
  }
  return [];
}

function matchesProductType(node: Record<string, unknown>): boolean {
  const type = node["@type"];
  if (typeof type === "string") return type === "Product";
  if (Array.isArray(type)) return type.includes("Product");
  return false;
}

function normalizeJsonLdProduct(node: Record<string, unknown>): JsonLdProduct {
  const images: string[] = [];
  const img = node.image;
  if (Array.isArray(img)) {
    for (const entry of img) {
      const url = extractImageUrl(entry);
      if (url) images.push(url);
    }
  } else {
    const url = extractImageUrl(img);
    if (url) images.push(url);
  }

  let price: number | undefined;
  let currency: string | undefined;
  const offers = node.offers;
  const offer = Array.isArray(offers) ? offers[0] : offers;
  if (offer && typeof offer === "object") {
    const offerObj = offer as Record<string, unknown>;
    const rawPrice = offerObj.price ?? offerObj.lowPrice;
    if (typeof rawPrice === "string" || typeof rawPrice === "number") {
      const parsed = Number(rawPrice);
      if (!Number.isNaN(parsed)) price = parsed;
    }
    if (typeof offerObj.priceCurrency === "string") currency = offerObj.priceCurrency;
  }

  // schema.org additionalProperty: an array of {name, value} PropertyValue
  // entries. Real-world usage here is usually a single variant's specs
  // (e.g. the currently-selected size), not a full multi-size chart — so
  // this contributes at most one row, only when both a size label AND at
  // least one recognized measurement are genuinely present together.
  let sizeMeasurements: SizeMeasurementInput[] | undefined;
  const additionalProperty = node.additionalProperty;
  if (Array.isArray(additionalProperty)) {
    let size: string | undefined;
    const direct: Record<string, string> = {};
    const byUnit: Record<string, { cm?: string; in?: string }> = {};
    for (const entry of additionalProperty) {
      if (!entry || typeof entry !== "object") continue;
      const name = (entry as { name?: unknown }).name;
      const value = (entry as { value?: unknown }).value;
      if (typeof name !== "string" || (typeof value !== "string" && typeof value !== "number")) continue;
      const stringValue = String(value).trim();
      if (!stringValue) continue;
      if (SIZE_LABEL_KEY_HINT.test(name.trim()) || /^size$/i.test(name.trim())) {
        size = stringValue;
        continue;
      }
      const key = canonicalMeasurementKey(name);
      if (!key) continue;
      const unit = detectUnitFromJsonKey(name) ?? detectUnitFromHeaderText(name);
      if (unit) byUnit[key] = { ...byUnit[key], [unit]: stringValue };
      else direct[key] = stringValue;
    }
    const measurements = mergeUnitPairs(direct, byUnit);
    if (size && Object.keys(measurements).length > 0) {
      sizeMeasurements = [{ size, measurements }];
    }
  }

  return {
    name: typeof node.name === "string" ? node.name : undefined,
    description: typeof node.description === "string" ? node.description : undefined,
    images,
    price,
    currency,
    sizeMeasurements,
  };
}

function collectJsonLdProduct(html: string): JsonLdProduct | undefined {
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRegex.exec(html))) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(match[1].trim());
    } catch {
      continue;
    }
    const product = flattenJsonLd(parsed).find(matchesProductType);
    if (product) return normalizeJsonLdProduct(product);
  }
  return undefined;
}

function extractPrice(
  html: string,
  meta: MetaTag[],
  jsonLd: JsonLdProduct | undefined
): { current?: number; original?: number; currency?: string } {
  let current = jsonLd?.price;
  let currency = jsonLd?.currency;

  if (current === undefined) {
    const metaPrice = firstMetaValue(meta, "product:price:amount") || firstMetaValue(meta, "og:price:amount");
    if (metaPrice) {
      const parsed = Number(metaPrice.replace(/[^0-9.]/g, ""));
      if (!Number.isNaN(parsed)) current = parsed;
    }
  }
  if (!currency) {
    currency = firstMetaValue(meta, "product:price:currency") || firstMetaValue(meta, "og:price:currency");
  }
  if (current === undefined) {
    const genericMatch = html.match(/"price"\s*:\s*"?\$?(\d+(?:\.\d{1,2})?)"?/i);
    if (genericMatch) {
      const parsed = Number(genericMatch[1]);
      if (!Number.isNaN(parsed)) current = parsed;
    }
  }

  // Best-effort "original / list / compare-at" price — a small set of common
  // field names seen in storefronts' embedded JSON/state blobs.
  let original: number | undefined;
  const originalMatch = html.match(
    /"(?:originalPrice|listPrice|compareAtPrice|strikethroughPrice|wasPrice)"\s*:\s*"?\$?(\d+(?:\.\d{1,2})?)"?/i
  );
  if (originalMatch) {
    const parsed = Number(originalMatch[1]);
    if (!Number.isNaN(parsed)) original = parsed;
  }

  // An "original" price that isn't actually higher than the current price
  // isn't a real discount — drop it rather than show something misleading.
  if (original !== undefined && current !== undefined && original <= current) {
    original = undefined;
  }

  return { current, original, currency };
}

// Storefronts (SHEIN especially) often serve the same photo at several sizes
// under different URLs — a cart/gallery thumbnail alongside the full product
// shot. Rather than guess at a higher-res URL by rewriting one (too easy to
// produce a 404), this only *ranks* the URLs actually discovered: a "WxH"
// size hint in the path (e.g. "1728x2205") scores by pixel area, and an
// explicit "thumbnail"/"thumb"/"mini"/"small" marker (e.g.
// "thumbnail_405x552") is pushed to the bottom regardless of its parsed
// size. URLs with neither signal keep their original relative order.
// A plain `\b` word boundary doesn't fire between "_" and a letter (both are
// \w), so a real-world filename like "desc_thumbnail_405x552.webp" — the
// exact shape SHEIN uses — would slip past `\bthumbnail\b` undetected. This
// instead requires the keyword to sit between path/filename delimiters
// (start/end, "/", "_", ".", "-") on both sides.
const LOW_QUALITY_IMAGE_HINT = /(?:^|[/_.\-])(?:thumbnails?|thumbs?|mini|small)(?:[/_.\-]|$)/i;

function estimateImageQualityScore(url: string): number {
  let score = 0;
  for (const match of url.matchAll(/(\d{2,5})[x×](\d{2,5})(?!\d)/g)) {
    const width = Number(match[1]);
    const height = Number(match[2]);
    if (Number.isFinite(width) && Number.isFinite(height)) {
      score = Math.max(score, width * height);
    }
  }
  if (LOW_QUALITY_IMAGE_HINT.test(url)) {
    score -= 10_000_000;
  }
  return score;
}

function collectImages(html: string, meta: MetaTag[], jsonLd: JsonLdProduct | undefined, baseUrl: URL): string[] {
  const candidates: string[] = [
    ...allMetaValues(meta, "og:image"),
    ...allMetaValues(meta, "og:image:secure_url"),
    ...allMetaValues(meta, "twitter:image"),
    ...(jsonLd?.images ?? []),
  ];

  const imgTagRegex = /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)')[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = imgTagRegex.exec(html))) {
    const src = match[1] || match[2];
    if (src) candidates.push(src);
  }

  const seen = new Set<string>();
  const resolved: string[] = [];
  for (const src of candidates) {
    if (!src || /^data:/i.test(src)) continue;
    let absolute: string;
    try {
      absolute = new URL(src, baseUrl).toString();
    } catch {
      continue;
    }
    if (!/^https?:\/\//i.test(absolute)) continue;
    if (/\b(sprite|icon|logo|favicon|pixel|blank|spacer|avatar)\b/i.test(absolute)) continue;
    if (seen.has(absolute)) continue;
    seen.add(absolute);
    resolved.push(absolute);
    if (resolved.length >= 60) break;
  }

  return resolved
    .map((url, index) => ({ url, index, score: estimateImageQualityScore(url) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.url)
    .slice(0, 24);
}

// ---------------------------------------------------------------------------
// Strategy 1 (of the size-chart fallback chain): server-rendered <table>.
// ---------------------------------------------------------------------------

function stripCellTags(cell: string): string {
  return decodeHtmlEntities(cell.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function extractTableRows(tableInnerHtml: string): string[][] {
  const rows: string[][] = [];
  const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRegex.exec(tableInnerHtml))) {
    const cellRegex = /<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi;
    const cells: string[] = [];
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(rowMatch[1]))) {
      cells.push(stripCellTags(cellMatch[1]));
    }
    if (cells.length > 0) rows.push(cells);
  }
  return rows;
}

function extractSizeChartFromTables(html: string): SizeMeasurementInput[] | undefined {
  const tableRegex = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
  let tableMatch: RegExpExecArray | null;
  while ((tableMatch = tableRegex.exec(html))) {
    const rows = extractTableRows(tableMatch[1]);
    if (rows.length < 2) continue;

    const header = rows[0];
    const sizeColumnIndex = header.findIndex((cell) => SIZE_COLUMN_HINT.test(cell));
    if (sizeColumnIndex === -1) continue;

    const measurementColumns: MeasurementColumn[] = header
      .map((cell, index) => {
        const key = canonicalMeasurementKey(cell);
        if (!key) return null;
        return { index, key, unit: detectUnitFromHeaderText(cell) };
      })
      .filter((entry): entry is MeasurementColumn => entry !== null);
    if (measurementColumns.length === 0) continue;

    const columnsByKey = groupColumnsByKey(measurementColumns);

    const chart: SizeMeasurementInput[] = [];
    for (const row of rows.slice(1)) {
      const size = row[sizeColumnIndex];
      if (!size) continue;
      const measurements = buildMeasurementsForRow(row, columnsByKey);
      if (Object.keys(measurements).length > 0) chart.push({ size, measurements });
    }
    if (chart.length > 0) return chart;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Strategy 2: embedded JSON / SSR hydration data — Next.js's `__NEXT_DATA__`
// script tag when present, plus a generic scan for `window.X = {...}` /
// `var X = {...}` script assignments (the shape most non-Next storefronts
// use to hand off server state to their client-side app). Regex can't
// reliably match balanced/nested braces, so the JSON itself is extracted
// with a hand-rolled brace-counter that respects string literals.
// ---------------------------------------------------------------------------

function extractBalancedJson(text: string, startIndex: number): string | undefined {
  if (text[startIndex] !== "{") return undefined;
  let depth = 0;
  let inString = false;
  let stringChar = "";
  let escaped = false;
  const maxIndex = Math.min(text.length, startIndex + 2_000_000);
  for (let i = startIndex; i < maxIndex; i++) {
    const char = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === stringChar) inString = false;
      continue;
    }
    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      continue;
    }
    if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) return text.slice(startIndex, i + 1);
    }
  }
  return undefined;
}

function collectInlineJsonBlobs(html: string): unknown[] {
  const blobs: unknown[] = [];

  const nextDataMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (nextDataMatch) {
    try {
      blobs.push(JSON.parse(nextDataMatch[1].trim()));
    } catch {
      // Not valid standalone JSON — skip.
    }
  }

  const scriptRegex = /<script(?![^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch: RegExpExecArray | null;
  let scriptsScanned = 0;
  while ((scriptMatch = scriptRegex.exec(html)) && scriptsScanned < 40 && blobs.length < 60) {
    const scriptBody = scriptMatch[1];
    if (scriptBody.length > 2_000_000) continue;
    scriptsScanned++;

    const assignmentRegex = /(?:window\.[\w$.]+|(?:var|let|const)\s+\w+)\s*=\s*(\{)/g;
    let assignmentMatch: RegExpExecArray | null;
    let blobsFromThisScript = 0;
    while ((assignmentMatch = assignmentRegex.exec(scriptBody)) && blobsFromThisScript < 5) {
      const jsonText = extractBalancedJson(scriptBody, assignmentMatch.index + assignmentMatch[0].length - 1);
      if (!jsonText) continue;
      try {
        blobs.push(JSON.parse(jsonText));
        blobsFromThisScript++;
      } catch {
        // Real-world inline "JSON-ish" blobs often have unquoted keys or
        // trailing function calls JSON.parse rejects — expected, just skip.
      }
    }
  }

  return blobs;
}

function extractMeasurementsFromObject(obj: Record<string, unknown>): { size?: string; measurements: Record<string, string> } | undefined {
  let size: string | undefined;
  const direct: Record<string, string> = {};
  const byUnit: Record<string, { cm?: string; in?: string }> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value !== "string" && typeof value !== "number") continue;
    const stringValue = String(value).trim();
    if (!stringValue) continue;
    if (SIZE_LABEL_KEY_HINT.test(key)) {
      size = stringValue;
      continue;
    }
    const measurementKey = canonicalMeasurementKey(key);
    if (!measurementKey) continue;
    const unit = detectUnitFromJsonKey(key);
    if (unit) byUnit[measurementKey] = { ...byUnit[measurementKey], [unit]: stringValue };
    else direct[measurementKey] = stringValue;
  }

  const measurements = mergeUnitPairs(direct, byUnit);
  if (size && Object.keys(measurements).length > 0) return { size, measurements };
  return undefined;
}

/** Depth/result-capped recursive walk — looks for an array of ≥2 size-shaped objects (a real chart), the strongest signal available without knowing any retailer's exact field names in advance. */
function findSizeChartInJson(node: unknown, depth = 0): SizeMeasurementInput[] {
  if (depth > 8) return [];
  if (Array.isArray(node)) {
    const rowsFromThisArray: SizeMeasurementInput[] = [];
    for (const entry of node) {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const parsed = extractMeasurementsFromObject(entry as Record<string, unknown>);
        if (parsed?.size) rowsFromThisArray.push({ size: parsed.size, measurements: parsed.measurements });
      }
    }
    if (rowsFromThisArray.length >= 2) return rowsFromThisArray;

    for (const entry of node) {
      const found = findSizeChartInJson(entry, depth + 1);
      if (found.length > 0) return found;
    }
    return [];
  }
  if (node && typeof node === "object") {
    for (const value of Object.values(node)) {
      const found = findSizeChartInJson(value, depth + 1);
      if (found.length > 0) return found;
    }
  }
  return [];
}

function extractSizeChartFromInlineJson(html: string): SizeMeasurementInput[] | undefined {
  for (const blob of collectInlineJsonBlobs(html)) {
    const found = findSizeChartInJson(blob);
    if (found.length > 0) return found;
  }
  return undefined;
}

/** Never throws — a malformed page should degrade to "no size chart found," not break the whole import. Tries strategies in order (schema.org JSON-LD's own contribution is folded in by the caller) and returns the first that finds anything real. */
function safeExtractSizeChart(html: string, jsonLdContribution: SizeMeasurementInput[] | undefined): SizeMeasurementInput[] | undefined {
  try {
    if (jsonLdContribution && jsonLdContribution.length > 0) return jsonLdContribution;
    const fromInlineJson = extractSizeChartFromInlineJson(html);
    if (fromInlineJson && fromInlineJson.length > 0) return fromInlineJson;
    return extractSizeChartFromTables(html);
  } catch {
    return undefined;
  }
}

// A plain size-label list with no accompanying measurements — e.g.
// `"sizes": ["S","M","L","XL"]` in an embedded state blob. Only trusted
// when every captured token looks like a plausible clothing size, to avoid
// misreading an unrelated short-string array as sizing data.
const PLAUSIBLE_SIZE_LABEL = /^(?:XX?S|X?S|M|L|XX?L|XXX?L|[0-9]{1,2}(?:\.[0-9])?|ONE\s?SIZE|OS|[0-9]{1,3}[A-Z]{0,2})$/i;

function extractPlainSizeLabels(html: string): string[] | undefined {
  const match = html.match(/"(?:size|sizes|availableSizes|sizeList)"\s*:\s*\[\s*((?:"[^"]{1,12}"\s*,?\s*)+)\]/i);
  if (!match) return undefined;
  const labels = Array.from(match[1].matchAll(/"([^"]{1,12})"/g))
    .map((m) => m[1].trim())
    .filter(Boolean);
  const plausible = labels.filter((label) => PLAUSIBLE_SIZE_LABEL.test(label));
  return plausible.length >= 2 ? plausible : undefined;
}

function safeExtractSizeLabels(html: string, sizeMeasurements: SizeMeasurementInput[] | undefined): string[] | undefined {
  if (sizeMeasurements && sizeMeasurements.length > 0) {
    return sizeMeasurements.map((row) => row.size);
  }
  try {
    return extractPlainSizeLabels(html);
  } catch {
    return undefined;
  }
}

function extractFromHtml(html: string, baseUrl: URL): Omit<ScrapedProductData, "store" | "sizeImportStatus" | "sizeImportMessage"> {
  const meta = collectMetaTags(html);
  const jsonLd = collectJsonLdProduct(html);
  const price = extractPrice(html, meta, jsonLd);
  const sizeMeasurements = safeExtractSizeChart(html, jsonLd?.sizeMeasurements);

  return {
    title: cleanText(jsonLd?.name || firstMetaValue(meta, "og:title") || extractTitleTag(html)),
    description: cleanText(
      jsonLd?.description || firstMetaValue(meta, "og:description") || firstMetaValue(meta, "description")
    ),
    currentPrice: price.current,
    originalPrice: price.original,
    currency: price.currency,
    images: collectImages(html, meta, jsonLd, baseUrl),
    sizeMeasurements,
    sizes: safeExtractSizeLabels(html, sizeMeasurements),
  };
}
