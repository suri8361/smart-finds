/**
 * ============================================================================
 * WHERE THE SITE READS ITS PRODUCTS (Nov 2026 — "data without redeploy")
 * ============================================================================
 * Every push to tab/finish-v1 is a Netlify production deploy and costs 15 of
 * the 300 free monthly credits. So the product list, the home-page hero sets
 * and new photos live on the separate `data` branch of this repo, which Netlify
 * never builds. GitHub Pages publishes that branch at {DATA_PAGES_BASE}, and
 * the site reads catalog.json from there while it runs (lib/data/catalog.ts):
 *
 *   1. GitHub Pages (fast CDN)              DATA_SOURCES[0]
 *   2. raw.githubusercontent.com (backup)   DATA_SOURCES[1]
 *   3. the copy bundled in this deploy      lib/data/products.ts + lib/data/hero-rotation.ts
 *
 * Pages re-read the catalog in the background (see `revalidate` in app/layout.tsx
 * and app/page.tsx), and the import calls /api/refresh so new finds show within
 * a minute or two. New photos are served from the data branch too (PHOTO_BASE).
 * How to add, move or remove finds: README on the data branch and
 * nightly/README.md (box) "Data without redeploy".
 * ============================================================================
 */

export const DATA_REPO = "suri8361/smart-finds";
export const DATA_BRANCH = "data";
export const DATA_PAGES_BASE = "https://suri8361.github.io/smart-finds";

/** Tried in order; the first one that answers with a valid catalog wins. */
export const DATA_SOURCES = [
  `${DATA_PAGES_BASE}/catalog.json`,
  `https://raw.githubusercontent.com/${DATA_REPO}/${DATA_BRANCH}/catalog.json`,
];

/** Photos referenced as "/finds/x.jpg" that aren't part of this deploy are loaded from here. */
export const PHOTO_BASE = `${DATA_PAGES_BASE}/public`;

/** How long one server keeps a downloaded catalog before checking for a newer one (ms). */
export const CATALOG_MEMORY_MS = 60_000;

/** Give up on one source after this long (ms) and try the next. */
export const CATALOG_TIMEOUT_MS = 4_000;

/**
 * SHA-256 of the key /api/refresh accepts (the key itself is not in this repo;
 * the import tooling keeps it on Tab's box: nightly/refresh-key.txt).
 */
export const REFRESH_KEY_SHA256 = "aa070aeee71ca4b2da7eceb64669b4e4fffb85f38dfea196cc5d513f48551f0d";
