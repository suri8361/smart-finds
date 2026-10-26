#!/usr/bin/env node
/**
 * Smart Finds — import affiliate links from a Google Chat export.
 *
 * Reads:
 *   - a Google Takeout zip (takeout-*.zip), or the unzipped Takeout folder —
 *     every "Google Chat/Groups/<space>/messages.json" inside is read;
 *   - a single messages.json; or
 *   - a plain .txt file of pasted messages.
 *
 * Finds every Amazon / amzn.to / Temu / SHEIN / AliExpress link (short links
 * included), removes duplicates, follows short links to the real product page
 * (only the redirect headers are read), fills the title and photo from the
 * link preview Google Chat saved in the export (or, when there isn't one, from
 * the product page's og: tags if the store lets us read them), guesses a
 * category from the title, and writes a review spreadsheet (CSV).
 *
 * Nothing is added to the site by this script. Open the CSV in Excel / Google
 * Sheets, check each row, put "yes" in the approve column, save as CSV, then
 * run generate-products.mjs on it.
 *
 * Usage:
 *   node scripts/import/import-chat-links.mjs <takeout.zip | folder | messages.json | messages.txt> [options]
 *
 * Options:
 *   --out <file.csv>   where to write the review sheet (default: smartfinds-import-review.csv)
 *   --no-fetch         don't contact any website (no short-link resolving, no page reads)
 *   --no-pages         resolve short links, but don't read product pages for title/photo
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { CATEGORIES, cleanTitle, guessCategory, isShortLink, productKey, storeFromUrl, toCsv } from "./shared.mjs";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";

export const COLUMNS = [
  "approve",
  "store",
  "title",
  "category",
  "price",
  "original_price",
  "image",
  "affiliate_url",
  "resolved_url",
  "posted_at",
  "times_posted",
  "title_source",
  "audience",
  "occasion",
  "featured",
  "label",
  "description",
  "notes",
];

// ---------------------------------------------------------------- reading inputs

/** Minimal zip reader (stored + deflate entries) — enough for Google Takeout zips. */
function readZip(file) {
  const buf = fs.readFileSync(file);
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error(`${file} doesn't look like a zip file`);
  let count = buf.readUInt16LE(eocd + 10);
  let offset = buf.readUInt32LE(eocd + 16);
  // Zip64 (exports over 4 GB / 65k files)
  if (offset === 0xffffffff || count === 0xffff) {
    const loc = eocd - 20;
    if (buf.readUInt32LE(loc) === 0x07064b50) {
      const z64 = Number(buf.readBigUInt64LE(loc + 8));
      count = Number(buf.readBigUInt64LE(z64 + 32));
      offset = Number(buf.readBigUInt64LE(z64 + 48));
    }
  }
  const entries = [];
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(offset) !== 0x02014b50) break;
    const method = buf.readUInt16LE(offset + 10);
    let compSize = buf.readUInt32LE(offset + 20);
    let size = buf.readUInt32LE(offset + 24);
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    let local = buf.readUInt32LE(offset + 42);
    const name = buf.slice(offset + 46, offset + 46 + nameLen).toString("utf8");
    // zip64 extra field
    let e = offset + 46 + nameLen;
    const eEnd = e + extraLen;
    while (e + 4 <= eEnd) {
      const id = buf.readUInt16LE(e);
      const len = buf.readUInt16LE(e + 2);
      if (id === 0x0001) {
        let p = e + 4;
        if (size === 0xffffffff) {
          size = Number(buf.readBigUInt64LE(p));
          p += 8;
        }
        if (compSize === 0xffffffff) {
          compSize = Number(buf.readBigUInt64LE(p));
          p += 8;
        }
        if (local === 0xffffffff) local = Number(buf.readBigUInt64LE(p));
      }
      e += 4 + len;
    }
    entries.push({ name, method, compSize, size, local });
    offset += 46 + nameLen + extraLen + commentLen;
  }
  return {
    names: entries.map((x) => x.name),
    read(name) {
      const entry = entries.find((x) => x.name === name);
      const lNameLen = buf.readUInt16LE(entry.local + 26);
      const lExtraLen = buf.readUInt16LE(entry.local + 28);
      const start = entry.local + 30 + lNameLen + lExtraLen;
      const data = buf.slice(start, start + entry.compSize);
      if (entry.method === 0) return data.toString("utf8");
      if (entry.method === 8) return zlib.inflateRawSync(data).toString("utf8");
      throw new Error(`Unsupported compression in ${name}`);
    },
  };
}

function walk(dir) {
  const out = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const isChatMessagesFile = (p) => /(^|[\\/])messages\.json$/i.test(p) && /google chat/i.test(p.replace(/\\/g, "/"));

/** Returns [{ source, kind: "json"|"text", content }] */
export function loadSources(input) {
  const stat = fs.statSync(input);
  if (stat.isDirectory()) {
    const files = walk(input).filter((p) => isChatMessagesFile(path.relative(input, p)) || /messages\.json$/i.test(p));
    return files.map((f) => ({ source: path.relative(input, f), kind: "json", content: fs.readFileSync(f, "utf8") }));
  }
  if (/\.zip$/i.test(input)) {
    const zip = readZip(input);
    const names = zip.names.filter((n) => /messages\.json$/i.test(n) && /google chat\//i.test(n));
    return names.map((n) => ({ source: n, kind: "json", content: zip.read(n) }));
  }
  if (/\.json$/i.test(input)) return [{ source: path.basename(input), kind: "json", content: fs.readFileSync(input, "utf8") }];
  return [{ source: path.basename(input), kind: "text", content: fs.readFileSync(input, "utf8") }];
}

// ---------------------------------------------------------------- extracting links

const URL_RE = /https?:\/\/[^\s<>"'`]+|(?<![\w@/.])(?:www\.)?(?:amzn\.to|a\.co|temu\.to|ali\.ski|s\.click\.aliexpress\.com|a\.aliexpress\.com)\/[^\s<>"'`]+/gi;

function cleanUrl(raw) {
  let url = raw.replace(/[)\]}>.,;:!?'"*_]+$/, "");
  // Keep a closing paren that belongs to the URL, e.g. ...(Black)
  const opens = (url.match(/\(/g) || []).length;
  const closes = (url.match(/\)/g) || []).length;
  if (raw.length > url.length && raw[url.length] === ")" && opens > closes) url += ")";
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  return url;
}

/** Pulls every string value out of a link-preview object that looks like a URL. */
function urlsInObject(obj, out = []) {
  if (typeof obj === "string") {
    if (/^https?:\/\//i.test(obj)) out.push(obj);
  } else if (obj && typeof obj === "object") {
    for (const value of Object.values(obj)) urlsInObject(value, out);
  }
  return out;
}

/** [{ url, postedAt, preview: {title,image}|null, source }] in posting order */
export function extractLinks(sources) {
  const found = [];
  for (const src of sources) {
    if (src.kind === "text") {
      for (const m of src.content.matchAll(URL_RE)) {
        const url = cleanUrl(m[0]);
        if (storeFromUrl(url)) found.push({ url, postedAt: "", preview: null, source: src.source });
      }
      continue;
    }
    let data;
    try {
      data = JSON.parse(src.content);
    } catch {
      console.warn(`! Skipped ${src.source}: not valid JSON`);
      continue;
    }
    const messages = Array.isArray(data) ? data : data.messages || [];
    for (const msg of messages) {
      const text = msg.text || "";
      const postedAt = msg.created_date || msg.updated_date || "";
      // Link previews Google Chat saved with the message.
      const previews = [];
      for (const ann of msg.annotations || []) {
        const meta = ann.url_metadata || ann.urlMetadata;
        if (!meta) continue;
        const urls = urlsInObject(meta.url || meta).filter((u) => !/googleusercontent|gstatic|ggpht/.test(u));
        let annotatedText = "";
        if (Number.isInteger(ann.start_index) && Number.isInteger(ann.length)) {
          annotatedText = text.slice(ann.start_index, ann.start_index + ann.length);
        }
        previews.push({
          urls: [...urls, annotatedText].filter(Boolean).map(cleanUrl),
          title: (meta.title || "").trim(),
          image: meta.image_url || meta.imageUrl || "",
        });
      }
      const urlsInText = [...text.matchAll(URL_RE)].map((m) => cleanUrl(m[0]));
      const previewUrls = previews.flatMap((p) => p.urls);
      for (const url of [...new Set([...urlsInText, ...previewUrls])]) {
        if (!storeFromUrl(url)) continue;
        const preview = previews.find((p) => p.urls.includes(url)) || (previews.length === 1 && urlsInText.length === 1 ? previews[0] : null);
        found.push({
          url,
          postedAt,
          preview: preview && (preview.title || preview.image) ? { title: preview.title, image: preview.image } : null,
          source: src.source,
        });
      }
    }
  }
  return found;
}

// ---------------------------------------------------------------- network (optional)

/** Follows redirects by reading only the Location header (HEAD, then GET if HEAD isn't allowed). */
export async function resolveRedirects(url, maxHops = 8) {
  let current = url;
  for (let hop = 0; hop < maxHops; hop++) {
    let res;
    for (const method of ["HEAD", "GET"]) {
      try {
        res = await fetch(current, {
          method,
          redirect: "manual",
          headers: { "user-agent": UA, accept: "text/html,*/*" },
          signal: AbortSignal.timeout(10000),
        });
        if (res.body) await res.body.cancel().catch(() => {});
        if (res.status !== 405 && res.status !== 403) break;
      } catch {
        res = null;
      }
    }
    if (!res) return { url: current, error: "no answer" };
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, current).toString();
      continue;
    }
    return { url: current, status: res.status };
  }
  return { url: current, error: "too many redirects" };
}

function metaContent(html, prop) {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  return tag?.match(/content=["']([^"']*)["']/i)?.[1] ?? "";
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .trim();
}

const GENERIC_TITLES =
  /^(amazon\.com|shein|temu|aliexpress|robot check|access denied|captcha|just a moment|page not found|sorry|attention required)|shop online fashion|online shopping for|^women's & men's clothing|download (the )?app/i;

/** Reads og:title / og:image from a product page when the store lets us. Returns {} when blocked. */
export async function readPagePreview(url) {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": UA, accept: "text/html", "accept-language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return { blocked: `HTTP ${res.status}` };
    const html = (await res.text()).slice(0, 600000);
    const rawTitle = decodeEntities(metaContent(html, "og:title") || html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] || "");
    const title = GENERIC_TITLES.test(rawTitle) ? rawTitle : cleanTitle(rawTitle);
    const image = decodeEntities(metaContent(html, "og:image") || html.match(/id=["']landingImage["'][^>]*data-old-hires=["']([^"']+)/i)?.[1] || "");
    // A generic title means a block page or the store's home page — its photo isn't the product's either.
    if (!title || GENERIC_TITLES.test(title)) return { blocked: title ? `generic page title "${title.slice(0, 40)}"` : "no title on page" };
    return { title, image };
  } catch (err) {
    return { blocked: err.name === "TimeoutError" ? "timed out" : "could not load" };
  }
}

/** A readable title from the product URL itself (SHEIN / AliExpress / Temu put the name in the path). */
function titleFromUrl(url) {
  try {
    const u = new URL(url);
    const p = decodeURIComponent(u.pathname);
    let m = p.match(/\/([^/]+?)-p-\d+/) || p.match(/\/([^/]+?)-g-\d+\.html/) || p.match(/\/([A-Za-z0-9-]{12,})\/dp\//);
    if (!m) return "";
    const t = m[1].replace(/-/g, " ").replace(/\s+/g, " ").trim();
    return t.length >= 8 ? t.charAt(0).toUpperCase() + t.slice(1) : "";
  } catch {
    return "";
  }
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    })
  );
  return out;
}

// ---------------------------------------------------------------- main

export async function buildRows(found, { fetchNetwork = true, fetchPages = true, log = console.log } = {}) {
  // 1. exact duplicates
  const byUrl = new Map();
  for (const f of found) {
    const hit = byUrl.get(f.url);
    if (hit) {
      hit.count++;
      if (!hit.preview && f.preview) hit.preview = f.preview;
    } else byUrl.set(f.url, { ...f, count: 1 });
  }
  const unique = [...byUrl.values()];
  log(`Found ${found.length} store links, ${unique.length} unique.`);

  // 2. resolve short links
  if (fetchNetwork) {
    const shorts = unique.filter((u) => isShortLink(u.url));
    if (shorts.length) log(`Resolving ${shorts.length} short links…`);
    await mapLimit(shorts, 4, async (item) => {
      const r = await resolveRedirects(item.url);
      item.resolved = r.url !== item.url ? r.url : "";
      if (r.error && !item.resolved) item.note = `short link didn't resolve (${r.error})`;
      else if (r.status >= 400) item.note = `link may be broken (HTTP ${r.status})`;
      if (item.resolved && /^\/?$/.test(new URL(item.resolved).pathname)) {
        item.note = "short link opens the store's home page, not a product (expired or broken link?)";
      }
    });
  }

  // 3. same product under different links → one row
  const byKey = new Map();
  for (const item of unique) {
    const key = productKey(item.resolved || item.url);
    const hit = byKey.get(key);
    if (hit) {
      hit.count += item.count;
      hit.alsoPostedAs.push(item.url);
      if (!hit.preview && item.preview) hit.preview = item.preview;
    } else byKey.set(key, { ...item, alsoPostedAs: [] });
  }
  const products = [...byKey.values()];

  // 4. titles and photos
  await mapLimit(products, 3, async (item) => {
    const target = item.resolved || item.url;
    item.title = cleanTitle(item.preview?.title || "");
    item.image = item.preview?.image || "";
    item.titleSource = item.title ? "chat preview" : "";
    if ((!item.title || !item.image) && fetchNetwork && fetchPages) {
      const page = await readPagePreview(target);
      if (!item.title && page.title) {
        item.title = page.title;
        item.titleSource = "product page";
      }
      if (!item.image && page.image) item.image = page.image;
      if (page.blocked && !item.title) item.pageNote = `store page not readable (${page.blocked})`;
    }
    if (!item.title) {
      const t = titleFromUrl(target);
      if (t) {
        item.title = t;
        item.titleSource = "link text";
      }
    }
  });

  return products.map((item) => {
    const target = item.resolved || item.url;
    const store = storeFromUrl(target) || storeFromUrl(item.url);
    const notes = [];
    if (item.note) notes.push(item.note);
    if (item.pageNote) notes.push(item.pageNote);
    if (!item.title) notes.push("needs a title");
    if (!item.image) notes.push("needs a photo");
    if (store === "Amazon") notes.push("Amazon: price not shown on the site");
    else notes.push("add price");
    if (item.alsoPostedAs.length) notes.push(`also posted as ${item.alsoPostedAs.join(" ")}`);
    return {
      approve: "",
      store,
      title: item.title,
      category: guessCategory(item.title, target),
      price: "",
      original_price: "",
      image: item.image,
      affiliate_url: item.url,
      resolved_url: item.resolved || "",
      posted_at: item.postedAt,
      times_posted: item.count,
      title_source: item.titleSource || "",
      audience: "",
      occasion: "",
      featured: "",
      label: "",
      description: "",
      notes: notes.join("; "),
    };
  });
}

async function main() {
  const args = process.argv.slice(2);
  const input = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--out");
  const outIdx = args.indexOf("--out");
  const out = outIdx >= 0 ? args[outIdx + 1] : "smartfinds-import-review.csv";
  if (!input || args.includes("--help")) {
    console.log("Usage: node scripts/import/import-chat-links.mjs <takeout.zip | folder | messages.json | messages.txt> [--out file.csv] [--no-fetch] [--no-pages]");
    process.exit(input ? 0 : 1);
  }
  const sources = loadSources(input);
  if (sources.length === 0) {
    console.error("No Google Chat messages.json files found in that export. Is Google Chat included in the Takeout?");
    process.exit(1);
  }
  console.log(`Reading ${sources.length} chat file(s).`);
  const found = extractLinks(sources);
  const rows = await buildRows(found, { fetchNetwork: !args.includes("--no-fetch"), fetchPages: !args.includes("--no-pages") });
  fs.writeFileSync(out, "\uFEFF" + toCsv(rows, COLUMNS));
  const byStore = rows.reduce((acc, r) => ((acc[r.store] = (acc[r.store] || 0) + 1), acc), {});
  console.log(`Wrote ${rows.length} products to ${out}`);
  console.log("By store:", byStore);
  console.log(`With title: ${rows.filter((r) => r.title).length}, with photo: ${rows.filter((r) => r.image).length}`);
  console.log(`Categories used: ${[...new Set(rows.map((r) => r.category))].filter((c) => CATEGORIES.includes(c)).join(", ")}`);
  console.log('Next: open the CSV, fill price/category, put "yes" in approve, save as CSV, then run generate-products.mjs.');
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("import-chat-links.mjs")) {
  main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
  });
}
