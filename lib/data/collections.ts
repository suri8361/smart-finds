import type { Collection } from "@/types/catalog";
import { publicProducts as products } from "@/lib/data/products";
import { getProductCategoriesInGroup } from "@/lib/data/productCategories";

/**
 * Curated "best of" collections. Membership is derived from each product's
 * own `collection` field (lib/data/products.ts) — a product declares which
 * collection it belongs to, rather than the collection listing its members.
 * To add a product to a collection, just set `collection: "<this-slug>"` on
 * the product; there's nothing to edit here for that.
 */
export const collections: Collection[] = [
  {
    slug: "under-50-desk-upgrades",
    title: "Under-$50 Desk Upgrades",
    description: "Small changes that make a work-from-home desk feel considered.",
    accent: "brand",
  },
  {
    slug: "warm-weather-camp-essentials",
    title: "Warm-Weather Camp Essentials",
    description: "What's actually worth packing for a summer weekend outdoors.",
    accent: "emerald",
  },
  {
    slug: "trending-beauty-tools",
    title: "Trending Beauty Tools",
    description: "The self-care gadgets showing up everywhere this season.",
    accent: "rose",
  },
  {
    slug: "everyday-carry-tech",
    title: "Everyday Carry Tech",
    description: "Small tech that earns a permanent spot in your bag.",
    accent: "amber",
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((collection) => collection.slug === slug);
}

/** Collections that include at least one product from the given broad category group — powers "Related Collections" on category pages. */
export function getCollectionsRelatedToCategory(categoryGroupSlug: string): Collection[] {
  const categoriesInGroup = new Set(getProductCategoriesInGroup(categoryGroupSlug));
  const relatedSlugs = new Set(
    products.filter((product) => categoriesInGroup.has(product.category) && product.collection).map((product) => product.collection)
  );
  return collections.filter((collection) => relatedSlugs.has(collection.slug));
}

/** The collection a product belongs to (if any) — powers "Related Collections" on the product detail page. */
export function getCollectionsContainingProduct(productSlug: string): Collection[] {
  const product = products.find((p) => p.slug === productSlug);
  if (!product?.collection) return [];
  const collection = getCollectionBySlug(product.collection);
  return collection ? [collection] : [];
}
