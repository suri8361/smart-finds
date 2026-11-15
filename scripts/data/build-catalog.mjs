#!/usr/bin/env node
/**
 * Build catalog.json — the file the live site reads at runtime (Nov 2026, "data without redeploy").
 *
 *   node scripts/data/build-catalog.mjs [--out catalog.json] [--hero hero.json] [--products lib/data/products.ts]
 *
 * Reads the products array from lib/data/products.ts (the same file the importer edits) and the
 * home-page hero sets from hero.json when it exists (otherwise from HERO_SEASONS in
 * lib/data/hero-rotation.ts), checks them, and writes one JSON file:
 *   { schema, version, generatedAt, productCount, products: [...], hero: { winter, spring, summer, fall } }
 * Exit code 1 (and nothing written) when a check fails — fix the data and run it again.
 * The data branch README explains where the output goes.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const root = process.cwd();
const productsPath = path.resolve(root, opt("--products", "lib/data/products.ts"));
const heroJsonPath = path.resolve(root, opt("--hero", "hero.json"));
const heroTsPath = path.resolve(root, "lib/data/hero-rotation.ts");
const outPath = path.resolve(root, opt("--out", "catalog.json"));

/** Text of the bracketed/braced literal that starts right after `marker` (string-aware bracket matching). */
function literalAfter(source, marker, open) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`could not find "${marker}"`);
  const from = source.indexOf(open, start + marker.length - 1);
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let quote = null;
  for (let i = from; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (ch === "\\") i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "/" && source[i + 1] === "/") { i = source.indexOf("\n", i); continue; }
    if (ch === "/" && source[i + 1] === "*") { i = source.indexOf("*/", i) + 1; continue; }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return source.slice(from, i + 1);
    }
  }
  throw new Error(`unbalanced literal after "${marker}"`);
}

const evaluate = (literal) => new Function(`"use strict"; return (${literal});`)();

const errors = [];
const productsSource = fs.readFileSync(productsPath, "utf8");
const products = evaluate(literalAfter(productsSource, "export const products: Product[] = [", "["));

let hero;
let heroFrom;
if (fs.existsSync(heroJsonPath)) {
  hero = JSON.parse(fs.readFileSync(heroJsonPath, "utf8"));
  heroFrom = path.relative(root, heroJsonPath);
} else {
  hero = evaluate(literalAfter(fs.readFileSync(heroTsPath, "utf8"), "export const HERO_SEASONS: Record<HeroSeason, HeroSet[]> = {", "{"));
  heroFrom = "lib/data/hero-rotation.ts";
}

// ---- product checks -------------------------------------------------------
const REQUIRED = ["slug", "name", "affiliateUrl", "store", "category"];
const seen = new Set();
products.forEach((p, i) => {
  const where = `products[${i}] (${p && p.slug})`;
  if (!p || typeof p !== "object") return errors.push(`${where}: not an object`);
  for (const key of REQUIRED) if (typeof p[key] !== "string" || !p[key].trim()) errors.push(`${where}: missing ${key}`);
  if (seen.has(p.slug)) errors.push(`${where}: duplicate slug`);
  seen.add(p.slug);
  if (p.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)) errors.push(`${where}: slug must be lowercase letters, digits and dashes`);
  if (p.image !== undefined && typeof p.image !== "string") errors.push(`${where}: image must be a string`);
  if (p.images !== undefined && !Array.isArray(p.images)) errors.push(`${where}: images must be a list`);
});
if (products.length < 100) errors.push(`only ${products.length} products — refusing to publish a catalog that small`);

// ---- hero checks (same rules as heroRuleProblems in lib/data/hero-rotation.ts) ----
const bySlug = new Map(products.map((p) => [p.slug, p]));
const pickSlug = (pick) => (typeof pick === "string" ? pick : pick && pick.slug);
for (const season of ["winter", "spring", "summer", "fall"]) {
  const sets = hero && hero[season];
  if (!Array.isArray(sets) || sets.length === 0) { errors.push(`hero.${season}: needs at least one set`); continue; }
  sets.forEach((set, i) => {
    const where = `hero.${season}[${i + 1}]`;
    let tried = 0;
    for (const spot of ["tall", "top", "bottom"]) {
      const slug = pickSlug(set && set[spot]);
      const product = bySlug.get(slug);
      if (!slug) { errors.push(`${where}.${spot}: missing`); continue; }
      if (!product) { errors.push(`${where}.${spot}: "${slug}" is not in products`); continue; }
      if (product.hidden) errors.push(`${where}.${spot}: "${slug}" is hidden`);
      if (!product.image) errors.push(`${where}.${spot}: "${slug}" has no photo`);
      if (typeof set[spot] === "object" && !["top", "center", "bottom"].includes(set[spot].focus)) errors.push(`${where}.${spot}: focus must be top, center or bottom`);
      if (product.recommendationLabel === "personally_tried") tried += 1;
    }
    if (tried === 0) errors.push(`${where}: needs at least one Tried & True find (Sara's rule, Nov 1 2026)`);
  });
}

if (errors.length) {
  console.error(`catalog NOT written — ${errors.length} problem(s):\n  - ` + errors.slice(0, 50).join("\n  - "));
  process.exit(1);
}

const generatedAt = new Date().toISOString();
const body = { products, hero };
const hash = crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 10);
const catalog = {
  schema: 1,
  version: `${generatedAt.replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z")}-${hash}`,
  generatedAt,
  contentHash: hash,
  productCount: products.length,
  heroFrom,
  products,
  hero,
};
fs.writeFileSync(outPath, JSON.stringify(catalog));
console.log(JSON.stringify({ ok: true, out: path.relative(root, outPath), version: catalog.version, productCount: products.length, heroFrom, bytes: fs.statSync(outPath).size }));
