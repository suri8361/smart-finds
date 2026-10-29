#!/usr/bin/env node
/**
 * Smart Finds — add new Google Chat posts (a nightly new-posts-*.json) to the site.
 *
 * The nightly reader (Tab's side) saves every new post from the "Smart Finds"
 * chat as new-posts-<date>.json: time, text, links exactly as posted, and the
 * photos it downloaded (<message_id>-0.png, -1.png … in a folder beside it).
 * This script turns those posts into products at the TOP of
 * lib/data/products.ts, so they show first in "New Finds".
 *
 *   - affiliate link: the first link in the post, copied exactly as posted
 *   - store: from the link (Amazon, Temu, SHEIN, AliExpress …)
 *   - title: her caption without the link, the price and "Great reviews!"-style words
 *   - price: the first $ amount in her caption ("from $11.84" -> 11.84); Amazon never gets one
 *   - description: her caption without the link (Amazon: without prices too)
 *   - category: guessed from the title (same guesser as the chat importer);
 *     clothing/shoes default to audience "women"
 *   - Tried & True: only when her caption says "Tried and True"
 *   - photos: copied into public/finds/<slug>-<n>.jpg (Google Chat photo links
 *     only open signed in). The first photo is the card photo; extra photos go
 *     in the gallery only when they're big real photos (not Amazon, which
 *     often has screenshots with prices on them)
 *   - a post whose link is already on the site is skipped
 *
 * Fix a guess with an overrides file next to the JSON
 * (new-posts-<date>.overrides.json), keyed by message_id or affiliate link:
 *   { "<message_id>": { "title": "...", "category": "home", "audience": "women",
 *                        "description": "...", "photos": [0, 2], "skip": true } }
 *
 * Usage:
 *   npm run import:posts -- <new-posts.json>            # dry run: prints what it would add
 *   npm run import:posts -- <new-posts.json> --write    # adds them + copies photos
 *   options: --images <folder>  (default: new-posts-images beside the JSON)
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { APPAREL_CATEGORIES, guessCategory, storeFromUrl } from "./shared.mjs";
import { rowsToProducts, toLiteral } from "./generate-products.mjs";

const ROOT = process.cwd();
const PRODUCTS_FILE = path.join(ROOT, "lib", "data", "products.ts");
const ARRAY_START = "export const products: Product[] = [";
const PUBLIC_DIR = path.join(ROOT, "public", "finds");
const PHOTO_EXT = /\.(png|jpe?g|webp)$/i;

const URL_RE = /https?:\/\/\S+/gi;
const PRICE_IN_TEXT = /(?:\bfrom\s+|\bonly\s+)?\$\s?\d[\d,]*(?:\.\d{1,2})?/gi;
const HYPE = /\b(great|amazing|excellent|good|awesome)\s+(reviews?|price|deal)\b[!.]*/gi;

function firstPrice(text) {
  const m = String(text).match(/\$\s?(\d[\d,]*(?:\.\d{1,2})?)/);
  return m ? m[1].replace(/,/g, "") : "";
}

function titleFrom(text) {
  let t = String(text)
    .replace(URL_RE, " ")
    .replace(/tried\s*(?:and|&|n)\s*true/gi, " ")
    .replace(PRICE_IN_TEXT, " ")
    .replace(HYPE, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,;:!.–-]+|[\s,;:!.–-]+$/g, "")
    .trim();
  if (t.length > 110) t = t.slice(0, 110).replace(/\s+\S*$/, "");
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

function captionFrom(text) {
  return String(text).replace(URL_RE, " ").replace(/\s{2,}/g, " ").replace(/[\s,;:–-]+$/g, "").trim();
}

function photosFor(post, imagesDir) {
  let files = (post.image_files || []).map((f) => (path.isAbsolute(f) ? f : path.join(imagesDir, path.basename(f))));
  files = files.filter((f) => fs.existsSync(f));
  if (!files.length && fs.existsSync(imagesDir)) {
    const id = post.message_id || post.topic_id;
    files = fs
      .readdirSync(imagesDir)
      .filter((f) => f.startsWith(id + "-") && PHOTO_EXT.test(f))
      .sort((a, b) => Number(a.slice(id.length + 1).split(".")[0]) - Number(b.slice(id.length + 1).split(".")[0]))
      .map((f) => path.join(imagesDir, f));
  }
  return files;
}

/** Width/height of a PNG or JPEG without any library (0,0 when unknown). */
function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b.slice(1, 4).toString() === "PNG") return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) break;
      const marker = b[i + 1];
      const len = b.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xc3) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + len;
    }
  }
  return { w: 0, h: 0 };
}

const hasFfmpeg = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;

/** Copies a photo into public/finds as a JPEG (via ffmpeg when present, else as-is). Returns the site path. */
function copyPhoto(src, slug, n) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  if (hasFfmpeg) {
    const name = `${slug}-${n}.jpg`;
    const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", src, "-vf", "scale='min(1200,iw)':-2", "-q:v", "3", path.join(PUBLIC_DIR, name)]);
    if (r.status === 0) return `/finds/${name}`;
  }
  const name = `${slug}-${n}${path.extname(src).toLowerCase()}`;
  fs.copyFileSync(src, path.join(PUBLIC_DIR, name));
  return `/finds/${name}`;
}

function main() {
  const args = process.argv.slice(2);
  const input = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--images");
  if (!input) {
    console.log("Usage: npm run import:posts -- <new-posts.json> [--write] [--images <folder>]");
    process.exit(1);
  }
  const write = args.includes("--write");
  const imgIdx = args.indexOf("--images");
  const imagesDir = imgIdx >= 0 ? path.resolve(args[imgIdx + 1]) : path.join(path.dirname(path.resolve(input)), "new-posts-images");
  const overridesFile = path.resolve(input).replace(/\.json$/i, ".overrides.json");
  const overrides = fs.existsSync(overridesFile) ? JSON.parse(fs.readFileSync(overridesFile, "utf8")) : {};
  const data = JSON.parse(fs.readFileSync(input, "utf8"));
  // Oldest first in the chat; newest should end up at the very top of the site.
  const posts = [...(data.posts || [])].sort((a, b) => String(b.time).localeCompare(String(a.time)));

  const rows = [];
  const photoPlans = [];
  for (const post of posts) {
    const link = (post.links || [])[0] || (String(post.text).match(URL_RE) || [])[0] || "";
    const o = overrides[post.message_id] || overrides[post.topic_id] || overrides[link] || {};
    if (o.skip) {
      console.log(`  - skipped by overrides: ${titleFrom(post.text).slice(0, 60)}`);
      continue;
    }
    const store = o.store || storeFromUrl(link);
    const title = o.title || titleFrom(post.text);
    const category = o.category || guessCategory(title, link);
    const isApparel = APPAREL_CATEGORIES.has(category);
    const audience = o.audience ?? (isApparel ? "women" : "");
    const files = photosFor(post, imagesDir);
    let picks;
    if (Array.isArray(o.photos)) picks = o.photos.filter((i) => files[i]);
    else {
      picks = files.length ? [0] : [];
      if (!/^amazon/i.test(store)) {
        files.forEach((f, i) => {
          if (i === 0) return;
          const { w, h } = imageSize(f);
          if (Math.min(w, h) >= 500 && w / h < 1.4) picks.push(i);
        });
      }
    }
    rows.push({
      approve: "yes",
      title,
      affiliate_url: link,
      store,
      category,
      audience,
      price: o.price ?? firstPrice(post.text),
      description: o.description || captionFrom(post.text),
      image: picks.length ? "(photo)" : "",
    });
    photoPlans.push({ link, files: picks.map((i) => files[i]) });
  }

  const source = fs.readFileSync(PRODUCTS_FILE, "utf8");
  const existingSlugs = new Set([...source.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]));
  const existingUrls = new Set([...source.matchAll(/affiliateUrl:\s*"([^"]+)"/g)].map((m) => m[1]));
  const { products, skipped, checks } = rowsToProducts(rows, existingSlugs, existingUrls);

  console.log(`${posts.length} posts, ${products.length} to add, ${skipped.length} skipped.`);
  for (const s of skipped) console.log(`  - ${s.title.slice(0, 60)}: ${s.reasons.join(", ")}`);
  for (const c of checks) console.log(`  ! ${c.title.slice(0, 60)}: ${c.note}`);

  for (const p of products) {
    const plan = photoPlans.find((x) => x.link === p.affiliateUrl);
    const files = plan ? plan.files : [];
    if (write) {
      const paths = files.map((f, n) => copyPhoto(f, p.slug, n + 1));
      p.image = paths[0];
      p.images = paths.length > 1 ? paths : undefined;
    } else {
      p.image = files.length ? `/finds/${p.slug}-1.jpg` : undefined;
    }
    if (!p.image && p.store.toLowerCase() === "temu") {
      p.hidden = true;
      p.hiddenWhy = "Temu, no photo yet: delete this line to show it";
    } else if (p.image) {
      p.hidden = false;
    }
    const price = p.currentPrice !== undefined ? `$${p.currentPrice}` : `Check price on ${p.store}`;
    console.log(`  + ${p.name.slice(0, 60)} | ${p.store} | ${p.category}${p.audience ? "/" + p.audience : ""} | ${price} | ${files.length} photo(s)${p.recommendationLabel ? " | Tried & True" : ""}${p.hidden ? " | HIDDEN" : ""}`);
  }
  if (!products.length) return;
  if (!write) {
    console.log("Dry run. Re-run with --write to add them.");
    return;
  }
  const block = products.map(toLiteral).join("\n");
  fs.writeFileSync(PRODUCTS_FILE, source.replace(ARRAY_START, `${ARRAY_START}\n${block}`));
  console.log(`Added ${products.length} products to the top of lib/data/products.ts (photos in public/finds). Run "npm run build" to check.`);
}

main();
