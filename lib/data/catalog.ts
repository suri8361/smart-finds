import http from "node:http";
import https from "node:https";
import { createGunzip } from "node:zlib";
import type { Product } from "@/types/catalog";
import { products as bundledProducts, getPublicProducts, setLiveProducts } from "@/lib/data/products";
import {
  HERO_SEASONS,
  HERO_SEASON_NAMES,
  heroRuleProblems,
  setLiveHeroSeasons,
  type HeroSeason,
  type HeroSet,
} from "@/lib/data/hero-rotation";
import {
  CATALOG_MEMORY_MS,
  CATALOG_TIMEOUT_MS,
  DATA_SOURCES,
  PHOTO_BASE,
} from "@/lib/config/data-source";

/**
 * ============================================================================
 * LIVE CATALOG LOADER (Nov 2026 — "data without redeploy")
 * ============================================================================
 * Every page calls `await loadCatalog()` before it reads products. It
 * downloads catalog.json from the `data` branch (lib/config/data-source.ts),
 * checks it, and swaps it in for the copy bundled with the deploy. A server
 * keeps what it downloaded for CATALOG_MEMORY_MS, then checks again.
 *
 * Never breaks the site: if every source is slow, down or sends something
 * that doesn't look right, the last good list stays in use (on a fresh server
 * that's the bundled copy in lib/data/products.ts).
 *
 * Photos: a product photo written as "/finds/x.jpg" that is not part of this
 * deploy (a find added after it) is loaded from the data branch (PHOTO_BASE).
 * ============================================================================
 */

export interface CatalogStatus {
  /** "data" = read from the data branch, "bundled" = the copy in this deploy. */
  source: "data" | "bundled";
  /** catalog.json's version (when it was built + content hash), or "bundled". */
  version: string;
  /** Which URL answered (data only). */
  from?: string;
  products: number;
  /** When this server last downloaded the catalog (ms since epoch), 0 = never. */
  fetchedAt: number;
  /** Why the data branch isn't in use, when it isn't. */
  problem?: string;
}

interface RawCatalog {
  schema?: number;
  version?: string;
  products?: unknown;
  hero?: unknown;
}

const IS_BUILD = process.env.NEXT_PHASE === "phase-production-build";

/** Photo paths that ship with this deploy (everything the bundled list points at). */
const BUNDLED_PHOTOS = new Set<string>(
  bundledProducts.flatMap((product) => [product.image, ...(product.images ?? [])].filter((src): src is string => Boolean(src)))
);

let status: CatalogStatus = {
  source: "bundled",
  version: "bundled",
  products: getPublicProducts().length,
  fetchedAt: 0,
};
let pending: Promise<CatalogStatus> | null = null;
let checkedAt = 0;

// Sara's rule: every hero set has a Tried & True find. The bundled sets must
// pass it or the build stops (so a broken pool can never be deployed).
if (IS_BUILD) {
  const problems = heroRuleProblems(HERO_SEASONS, (slug) => bundledProducts.find((p) => p.slug === slug && !p.hidden));
  if (problems.length > 0) {
    throw new Error(`lib/data/hero-rotation.ts breaks the hero rules:\n  - ${problems.join("\n  - ")}`);
  }
}

function photoUrl(src: string | undefined): string | undefined {
  if (!src || !src.startsWith("/") || src.startsWith("//") || BUNDLED_PHOTOS.has(src)) return src;
  return PHOTO_BASE + src.split("/").map(encodeURIComponent).join("/");
}

function getText(url: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("http://") ? http : https; // http only for a local test server (SF_CATALOG_URL)
    const request = client.get(
      url,
      { headers: { "user-agent": "smart-finds-site", accept: "application/json", "accept-encoding": "gzip", "cache-control": "no-cache" } },
      (response) => {
        if (response.statusCode !== 200) {
          response.resume();
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }
        const stream = response.headers["content-encoding"] === "gzip" ? response.pipe(createGunzip()) : response;
        stream.setEncoding("utf8");
        let body = "";
        stream.on("data", (chunk: string) => {
          body += chunk;
          if (body.length > 20_000_000) request.destroy(new Error("too large"));
        });
        stream.on("end", () => resolve(body));
        stream.on("error", reject);
      }
    );
    request.setTimeout(timeoutMs, () => request.destroy(new Error(`no answer in ${timeoutMs} ms`)));
    request.on("error", reject);
  });
}

const isText = (value: unknown) => typeof value === "string" && value.trim().length > 0;

/** Checks a downloaded catalog; returns its products (photos resolved) and hero sets, or throws why not. */
function parseCatalog(text: string): { version: string; products: Product[]; hero?: Record<HeroSeason, HeroSet[]> } {
  const raw = JSON.parse(text) as RawCatalog;
  if (raw.schema !== 1 || !Array.isArray(raw.products)) throw new Error("not a catalog.json (schema 1)");
  const list = raw.products as Product[];
  const slugs = new Set<string>();
  for (const product of list) {
    if (!product || !isText(product.slug) || !isText(product.name) || !isText(product.affiliateUrl) || !isText(product.store) || !isText(product.category)) {
      throw new Error(`a product is missing slug/name/link/store/category (${JSON.stringify(product)?.slice(0, 80)})`);
    }
    if (slugs.has(product.slug)) throw new Error(`duplicate slug ${product.slug}`);
    slugs.add(product.slug);
  }
  // A list less than half the size of the bundled one is almost certainly a broken file.
  if (list.length < Math.max(50, Math.floor(bundledProducts.length / 2))) {
    throw new Error(`only ${list.length} products (bundled copy has ${bundledProducts.length})`);
  }
  const products = list.map((product) => ({
    ...product,
    image: photoUrl(product.image),
    images: product.images?.map((src) => photoUrl(src) ?? src),
  }));

  let hero: Record<HeroSeason, HeroSet[]> | undefined;
  if (raw.hero && typeof raw.hero === "object") {
    const candidate = raw.hero as Record<HeroSeason, HeroSet[]>;
    const bySlug = new Map(products.map((product) => [product.slug, product]));
    const problems = HERO_SEASON_NAMES.some((season) => !Array.isArray(candidate[season]))
      ? ["missing a season"]
      : heroRuleProblems(candidate, (slug) => {
          const product = bySlug.get(slug);
          return product && !product.hidden ? product : undefined;
        });
    // Bad hero sets never take the products down with them: keep the current sets instead.
    if (problems.length === 0) hero = candidate;
    else console.warn(`[catalog] hero sets in catalog.json ignored: ${problems.slice(0, 5).join("; ")}`);
  }
  return { version: isText(raw.version) ? String(raw.version) : "unversioned", products, hero };
}

async function download(): Promise<CatalogStatus> {
  const override = process.env.SF_CATALOG_URL?.trim();
  if (process.env.SF_CATALOG_OFF === "1") {
    return { ...status, problem: "SF_CATALOG_OFF=1" };
  }
  const sources = override ? [override] : DATA_SOURCES;
  const problems: string[] = [];
  for (const source of sources) {
    // A unique query string skips the CDN copy, so a fresh data commit is seen right away.
    const url = `${source}${source.includes("?") ? "&" : "?"}t=${Date.now()}`;
    try {
      const parsed = parseCatalog(await getText(url, CATALOG_TIMEOUT_MS));
      setLiveProducts(parsed.products);
      if (parsed.hero) setLiveHeroSeasons(parsed.hero);
      status = {
        source: "data",
        version: parsed.version,
        from: source,
        products: getPublicProducts().length,
        fetchedAt: Date.now(),
      };
      return status;
    } catch (error) {
      problems.push(`${source}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.warn(`[catalog] keeping ${status.source} ${status.version}: ${problems.join(" | ")}`);
  return { ...status, problem: problems.join(" | ") };
}

/**
 * Makes sure the newest catalog is in use, then returns what's in use. Cheap to
 * call many times: one download per server per CATALOG_MEMORY_MS (during
 * `next build`, once for the whole build). `force` skips the wait.
 */
export function loadCatalog({ force = false }: { force?: boolean } = {}): Promise<CatalogStatus> {
  const now = Date.now();
  const fresh = checkedAt > 0 && (IS_BUILD || now - checkedAt < CATALOG_MEMORY_MS);
  // A download already under way: wait for it (never answer with the old list mid-download).
  if (!force && pending) return pending;
  if (!force && fresh) return Promise.resolve(status);
  checkedAt = now;
  const run = download().finally(() => {
    if (pending === run) pending = null;
  });
  pending = run;
  return run;
}

/** What's in use right now, without downloading. */
export function catalogStatus(): CatalogStatus {
  return status;
}
