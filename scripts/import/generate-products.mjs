#!/usr/bin/env node
/**
 * Smart Finds — turn an approved review CSV into products.ts entries.
 *
 * Only rows with "yes" (or y / x / 1 / true) in the approve column are used.
 * Each row needs: title, affiliate_url and a valid category. Price is
 * optional: without one the site shows "Check price on <store>" (Amazon never
 * shows a price). Rows that are missing something are listed and skipped,
 * never guessed. Temu rows without a photo (and rows with "yes" in a hidden
 * column) are added with `hidden: true`: kept in the data, off the site.
 *
 * The affiliate link is copied exactly as it is in the sheet. The Amazon tag
 * is added on the site when the link is shown (lib/affiliate.ts), not here.
 *
 * Usage:
 *   node scripts/import/generate-products.mjs <approved.csv>            # writes imported-products.txt to paste
 *   node scripts/import/generate-products.mjs <approved.csv> --write    # adds them straight into lib/data/products.ts
 *   options: --out <file>  (where to write the paste file)
 */
import fs from "node:fs";
import path from "node:path";
import {
  APPAREL_CATEGORIES,
  AUDIENCES,
  CATEGORIES,
  LABELS,
  OCCASIONS,
  TRIED_TRUE,
  holidaysFor,
  isMaternity,
  looksLikeApparel,
  parseCsv,
  storeFromUrl,
  stripPrices,
  stripTriedTrue,
} from "./shared.mjs";

const PRODUCTS_FILE = path.join(process.cwd(), "lib", "data", "products.ts");
const ARRAY_START = "export const products: Product[] = [";
const YES = new Set(["yes", "y", "x", "1", "true", "✓", "✔"]);
// Temu won't give its photos to a plain download, so photos found by opening each
// Temu link in a real browser are kept here (affiliate link -> photo) and used
// when the sheet's image column is empty.
const TEMU_PHOTOS_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), "temu-photos.json");
const TEMU_PHOTOS = fs.existsSync(TEMU_PHOTOS_FILE) ? JSON.parse(fs.readFileSync(TEMU_PHOTOS_FILE, "utf8")) : {};

export function slugify(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 8)
    .join("-");
}

function parsePrice(value) {
  if (!value) return undefined;
  const n = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : undefined;
}

const q = (s) => JSON.stringify(s);

function toLiteral(p) {
  const lines = [`  {`, `    slug: ${q(p.slug)},`, `    name: ${q(p.name)},`];
  if (p.image) lines.push(`    image: ${q(p.image)},`);
  if (p.currentPrice !== undefined) lines.push(`    currentPrice: ${p.currentPrice},`);
  if (p.originalPrice) lines.push(`    originalPrice: ${p.originalPrice},`);
  lines.push(`    affiliateUrl: ${q(p.affiliateUrl)},`);
  lines.push(`    store: ${q(p.store)},`);
  lines.push(`    category: ${q(p.category)},`);
  if (p.audience) lines.push(`    audience: ${q(p.audience)},`);
  if (p.occasion) lines.push(`    occasion: ${q(p.occasion)},`);
  if (p.holidays?.length) lines.push(`    holidays: ${q(p.holidays)},`);
  if (p.maternity) lines.push(`    maternity: true,`);
  // No default badge: only a real label (e.g. Tried & True from her caption) is written.
  if (p.recommendationLabel) lines.push(`    recommendationLabel: ${q(p.recommendationLabel)},`);
  lines.push(`    description: ${q(p.description)},`);
  if (p.featured) lines.push(`    featured: true,`);
  if (p.hidden) lines.push(`    hidden: true,${p.hiddenWhy ? " // " + p.hiddenWhy : ""}`);
  lines.push(`  },`);
  return lines.join("\n");
}

/** Returns { products: [...], skipped: [{row, title, reasons}] } */
export function rowsToProducts(rows, existingSlugs = new Set(), existingUrls = new Set()) {
  const products = [];
  const skipped = [];
  const checks = [];
  const used = new Set(existingSlugs);
  rows.forEach((row, i) => {
    const rowNo = i + 2; // header is row 1 in the spreadsheet
    if (!YES.has(String(row.approve || "").trim().toLowerCase())) return;
    const reasons = [];
    const name = (row.title || "").trim();
    const affiliateUrl = (row.affiliate_url || "").trim();
    const store = (row.store || "").trim() || storeFromUrl(row.resolved_url || affiliateUrl);
    const category = (row.category || "").trim().toLowerCase();
    const isAmazon = store.toLowerCase().startsWith("amazon");
    const price = parsePrice(row.price);
    const originalPrice = parsePrice(row.original_price);
    const audience = (row.audience || "").trim().toLowerCase().replace(/\s*\(default\)$/, "");
    const occasion = (row.occasion || "").trim().toLowerCase();
    const caption = (row.description || "").trim();
    const triedTrue = TRIED_TRUE.test(caption);
    // No default label any more (every product used to get "chosen_for_look"). Her "Tried and True" becomes the Tried & True badge.
    const label = (row.label || "").trim().toLowerCase() || (triedTrue ? "personally_tried" : "");

    if (!name) reasons.push("no title");
    if (!/^https?:\/\//i.test(affiliateUrl)) reasons.push("no affiliate_url");
    if (!store) reasons.push("no store");
    if (!CATEGORIES.includes(category)) reasons.push(`category "${row.category}" isn't one of the ${CATEGORIES.length}`);
    if (audience && !AUDIENCES.includes(audience)) reasons.push(`audience "${row.audience}" not recognised`);
    if (occasion && !OCCASIONS.includes(occasion)) reasons.push(`occasion "${row.occasion}" not recognised`);
    if (label && !LABELS.includes(label)) reasons.push(`label "${row.label}" not recognised`);
    if (existingUrls.has(affiliateUrl)) reasons.push("already on the site");
    if (reasons.length) {
      skipped.push({ row: rowNo, title: name || affiliateUrl, reasons });
      return;
    }

    // Catch the old misfiling: clothing filed under Home/School/Outdoor/etc. because the title said "vacation home" or "back to school".
    if (!APPAREL_CATEGORIES.has(category) && looksLikeApparel(name, caption) && !looksLikeApparel(category)) {
      checks.push({ row: rowNo, title: name, note: `category "${category}" but the title/caption reads like clothing — please check` });
    }

    const image = (row.image || "").trim() || TEMU_PHOTOS[affiliateUrl] || "";
    const hideReason = YES.has(String(row.hidden || "").trim().toLowerCase())
      ? "hidden in the sheet"
      : store.toLowerCase() === "temu" && !image
        ? "Temu, no photo yet: delete this line to show it"
        : "";

    let base = slugify(name) || slugify(store + " find");
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    existingUrls.add(affiliateUrl);

    products.push({
      slug,
      name,
      image: image || undefined,
      // Amazon never shows a stored price (Associates rules), so none is written.
      currentPrice: isAmazon ? undefined : price,
      originalPrice: !isAmazon && originalPrice && price && originalPrice > price ? originalPrice : undefined,
      affiliateUrl,
      store,
      category,
      audience: audience || undefined,
      occasion: occasion || undefined,
      recommendationLabel: label || undefined,
      holidays: row.holidays !== undefined && String(row.holidays).trim() !== ""
        ? String(row.holidays).split(/[,;]\s*/).map((h) => h.trim().toLowerCase()).filter(Boolean)
        : holidaysFor(caption, name),
      maternity: row.maternity !== undefined && String(row.maternity).trim() !== ""
        ? YES.has(String(row.maternity).trim().toLowerCase())
        : isMaternity(caption, name),
      // Amazon captions lose any price mention too (Associates rules: no stored prices); "Tried and True" moves to the badge.
      description: (() => {
        let text = triedTrue ? stripTriedTrue(caption) : caption;
        if (isAmazon) text = stripPrices(text);
        return text || `Found on ${store}.`;
      })(),
      featured: YES.has(String(row.featured || "").trim().toLowerCase()),
      hidden: hideReason !== "",
      hiddenWhy: hideReason,
    });
  });
  return { products, skipped, checks };
}

function main() {
  const args = process.argv.slice(2);
  const input = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--out");
  if (!input) {
    console.log("Usage: node scripts/import/generate-products.mjs <approved.csv> [--write] [--out file]");
    process.exit(1);
  }
  // The review sheet Tab hands over uses friendlier headers; map them to the importer's names.
  const ALIASES = { include: "approve", "image url": "image", "affiliate link": "affiliate_url", "her caption": "description", "product page": "resolved_url" };
  const rows = parseCsv(fs.readFileSync(input, "utf8")).map((r) => {
    const out = { ...r };
    for (const [from, to] of Object.entries(ALIASES)) if (from in r && !(to in r)) out[to] = r[from];
    return out;
  });
  const source = fs.existsSync(PRODUCTS_FILE) ? fs.readFileSync(PRODUCTS_FILE, "utf8") : "";
  const existingSlugs = new Set([...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]));
  const existingUrls = new Set([...source.matchAll(/affiliateUrl:\s*"([^"]+)"/g)].map((m) => m[1]));
  const { products, skipped, checks } = rowsToProducts(rows, existingSlugs, existingUrls);
  const approvedCount = rows.filter((r) => YES.has(String(r.approve || "").trim().toLowerCase())).length;

  const hiddenCount = products.filter((p) => p.hidden).length;
  console.log(`${rows.length} rows, ${approvedCount} approved, ${products.length} ready (${hiddenCount} hidden), ${skipped.length} skipped.`);
  for (const s of skipped) console.log(`  - row ${s.row} (${s.title.slice(0, 60)}): ${s.reasons.join(", ")}`);
  if (checks.length) console.log(`${checks.length} to double-check:`);
  for (const c of checks) console.log(`  - row ${c.row} (${c.title.slice(0, 60)}): ${c.note}`);
  if (products.length === 0) return;

  const block = products.map(toLiteral).join("\n");
  if (args.includes("--write")) {
    if (!source.includes(ARRAY_START)) throw new Error(`Couldn't find "${ARRAY_START}" in ${PRODUCTS_FILE}`);
    fs.writeFileSync(PRODUCTS_FILE, source.replace(ARRAY_START, `${ARRAY_START}\n${block}`));
    console.log(`Added ${products.length} products to the top of lib/data/products.ts. Run "npm run build" to check.`);
  } else {
    const outIdx = args.indexOf("--out");
    const out = outIdx >= 0 ? args[outIdx + 1] : "imported-products.txt";
    fs.writeFileSync(out, block + "\n");
    console.log(`Wrote ${out}. Paste it inside the products list in lib/data/products.ts, or re-run with --write.`);
  }
}

if (process.argv[1]?.endsWith("generate-products.mjs")) main();
