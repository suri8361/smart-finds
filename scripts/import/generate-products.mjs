#!/usr/bin/env node
/**
 * Smart Finds — turn an approved review CSV into products.ts entries.
 *
 * Only rows with "yes" (or y / x / 1 / true) in the approve column are used.
 * Each row needs: title, affiliate_url, a valid category, and a price (except
 * Amazon rows — the site shows "Check price on Amazon" for those). Rows that
 * are missing something are listed and skipped, never guessed.
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
import { AUDIENCES, CATEGORIES, LABELS, OCCASIONS, parseCsv, storeFromUrl } from "./shared.mjs";

const PRODUCTS_FILE = path.join(process.cwd(), "lib", "data", "products.ts");
const ARRAY_START = "export const products: Product[] = [";
const YES = new Set(["yes", "y", "x", "1", "true", "✓", "✔"]);

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
  lines.push(`    currentPrice: ${p.currentPrice},${p.priceComment ? " // " + p.priceComment : ""}`);
  if (p.originalPrice) lines.push(`    originalPrice: ${p.originalPrice},`);
  lines.push(`    affiliateUrl: ${q(p.affiliateUrl)},`);
  lines.push(`    store: ${q(p.store)},`);
  lines.push(`    category: ${q(p.category)},`);
  if (p.audience) lines.push(`    audience: ${q(p.audience)},`);
  if (p.occasion) lines.push(`    occasion: ${q(p.occasion)},`);
  lines.push(`    recommendationLabel: ${q(p.recommendationLabel)},`);
  lines.push(`    description: ${q(p.description)},`);
  if (p.featured) lines.push(`    featured: true,`);
  lines.push(`  },`);
  return lines.join("\n");
}

/** Returns { products: [...], skipped: [{row, title, reasons}] } */
export function rowsToProducts(rows, existingSlugs = new Set(), existingUrls = new Set()) {
  const products = [];
  const skipped = [];
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
    const audience = (row.audience || "").trim().toLowerCase();
    const occasion = (row.occasion || "").trim().toLowerCase();
    const label = (row.label || "").trim().toLowerCase() || "chosen_for_look";

    if (!name) reasons.push("no title");
    if (!/^https?:\/\//i.test(affiliateUrl)) reasons.push("no affiliate_url");
    if (!store) reasons.push("no store");
    if (!CATEGORIES.includes(category)) reasons.push(`category "${row.category}" isn't one of the 26`);
    if (!isAmazon && price === undefined) reasons.push("no price");
    if (audience && !AUDIENCES.includes(audience)) reasons.push(`audience "${row.audience}" not recognised`);
    if (occasion && !OCCASIONS.includes(occasion)) reasons.push(`occasion "${row.occasion}" not recognised`);
    if (!LABELS.includes(label)) reasons.push(`label "${row.label}" not recognised`);
    if (existingUrls.has(affiliateUrl)) reasons.push("already on the site");
    if (reasons.length) {
      skipped.push({ row: rowNo, title: name || affiliateUrl, reasons });
      return;
    }

    let base = slugify(name) || slugify(store + " find");
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    existingUrls.add(affiliateUrl);

    products.push({
      slug,
      name,
      image: (row.image || "").trim() || undefined,
      currentPrice: isAmazon ? price ?? 0 : price,
      priceComment: isAmazon ? "Amazon: not shown on the site (\"Check price on Amazon\")" : "",
      originalPrice: originalPrice && price && originalPrice > price ? originalPrice : undefined,
      affiliateUrl,
      store,
      category,
      audience: audience || undefined,
      occasion: occasion || undefined,
      recommendationLabel: label,
      description: (row.description || "").trim() || `Found on ${store}.`,
      featured: YES.has(String(row.featured || "").trim().toLowerCase()),
    });
  });
  return { products, skipped };
}

function main() {
  const args = process.argv.slice(2);
  const input = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--out");
  if (!input) {
    console.log("Usage: node scripts/import/generate-products.mjs <approved.csv> [--write] [--out file]");
    process.exit(1);
  }
  const rows = parseCsv(fs.readFileSync(input, "utf8"));
  const source = fs.existsSync(PRODUCTS_FILE) ? fs.readFileSync(PRODUCTS_FILE, "utf8") : "";
  const existingSlugs = new Set([...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]));
  const existingUrls = new Set([...source.matchAll(/affiliateUrl:\s*"([^"]+)"/g)].map((m) => m[1]));
  const { products, skipped } = rowsToProducts(rows, existingSlugs, existingUrls);
  const approvedCount = rows.filter((r) => YES.has(String(r.approve || "").trim().toLowerCase())).length;

  console.log(`${rows.length} rows, ${approvedCount} approved, ${products.length} ready, ${skipped.length} skipped.`);
  for (const s of skipped) console.log(`  - row ${s.row} (${s.title.slice(0, 60)}): ${s.reasons.join(", ")}`);
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
