import { useEffect, useState } from "react";
import type { Product } from "@/types/catalog";
import { DATA_SOURCES } from "@/lib/config/data-source";
import { withRemotePhotos } from "@/lib/photos";

/**
 * Bandwidth (Nov 4, 2026): long product lists are not sent in the page from
 * Netlify (billed per byte). The page sends the first cards plus the list of
 * slugs; the browser fills in the rest from catalog.json on GitHub Pages
 * (free, same file the server reads — lib/config/data-source.ts), once per
 * visit. Pages and raw.githubusercontent.com are tried in order.
 */
let pending: Promise<Map<string, Product>> | null = null;

async function download(): Promise<Map<string, Product>> {
  for (const url of DATA_SOURCES) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const raw = (await response.json()) as { schema?: number; products?: Product[] };
      if (raw.schema !== 1 || !Array.isArray(raw.products)) continue;
      return new Map(raw.products.filter((p) => p && p.slug).map((p) => [p.slug, withRemotePhotos(p)]));
    } catch {
      // try the next source
    }
  }
  throw new Error("catalog unavailable");
}

export function loadRemoteCatalog(): Promise<Map<string, Product>> {
  if (!pending) {
    pending = download().catch((error) => {
      pending = null; // let a later call try again
      throw error;
    });
  }
  return pending;
}

/**
 * The products for these slugs (in this order) once the catalog has arrived;
 * null while it loads. Slugs the catalog doesn't know are skipped.
 */
export function useRemoteProducts(slugs: string[], enabled = true): Product[] | null {
  const [catalog, setCatalog] = useState<Map<string, Product> | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadRemoteCatalog()
      .then((map) => alive && setCatalog(map))
      .catch(() => alive && setCatalog(new Map()));
    return () => {
      alive = false;
    };
  }, [enabled]);
  if (!catalog) return null;
  return slugs.map((slug) => catalog.get(slug)).filter((p): p is Product => Boolean(p));
}
