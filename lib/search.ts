import type { Product } from "@/types/catalog";
import { getProductCategoryLabel } from "@/lib/data/productCategories";

/** Lowercases and strips accents so "Café" matches "cafe". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function haystack(product: Product): string {
  return normalize(
    [product.name, product.store, product.category, getProductCategoryLabel(product.category) ?? ""].join(" ")
  );
}

/**
 * Client-side search over product name, store and category. Every word typed
 * must appear somewhere (so "black skirt" finds black skirts, not every skirt).
 * Name matches rank above store/category-only matches. An empty query returns
 * every product unchanged.
 */
export function searchProducts(products: Product[], query: string): Product[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return products;

  return products
    .map((product, index) => {
      const text = haystack(product);
      if (!terms.every((term) => text.includes(term))) return null;
      const name = normalize(product.name);
      const score = terms.reduce((sum, term) => sum + (name.includes(term) ? 2 : 1), 0);
      return { product, score, index };
    })
    .filter((hit): hit is { product: Product; score: number; index: number } => hit !== null)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((hit) => hit.product);
}
