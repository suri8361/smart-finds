import type { Collection } from "@/types/catalog";
import { products } from "@/lib/data/products";

/**
 * Placeholder "best of" collections. In a later milestone this becomes the
 * `Collection`/`CollectionItem` tables (SRS §11.1) with real editorial copy
 * and ordered product references. `productSlugs` is what stands in for
 * `CollectionItem` here — collections are curated across categories (not
 * confined to one), which is realistic editorial behavior, not a data bug.
 */
export const collections: Collection[] = [
  {
    slug: "under-50-desk-upgrades",
    title: "Under-$50 Desk Upgrades",
    description: "Small changes that make a work-from-home desk feel considered.",
    accent: "brand",
    productSlugs: ["adjustable-aluminum-laptop-stand", "minimalist-wireless-charging-stand", "ceramic-pour-over-dripper"],
  },
  {
    slug: "warm-weather-camp-essentials",
    title: "Warm-Weather Camp Essentials",
    description: "What's actually worth packing for a summer weekend outdoors.",
    accent: "emerald",
    productSlugs: ["nested-aluminum-camp-cookware", "insulated-steel-camp-mug"],
  },
  {
    slug: "trending-beauty-tools",
    title: "Trending Beauty Tools",
    description: "The self-care gadgets showing up everywhere this season.",
    accent: "rose",
    productSlugs: ["gua-sha-facial-tool-set"],
  },
  {
    slug: "everyday-carry-tech",
    title: "Everyday Carry Tech",
    description: "Small tech that earns a permanent spot in your bag.",
    accent: "amber",
    productSlugs: ["titanium-smartwatch-band", "minimalist-wireless-charging-stand"],
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((collection) => collection.slug === slug);
}

/** Collections that include at least one product from the given category — powers "Related Collections" on category pages. */
export function getCollectionsRelatedToCategory(categorySlug: string): Collection[] {
  return collections.filter((collection) =>
    collection.productSlugs.some((slug) => {
      const product = products.find((p) => p.slug === slug);
      return product?.categorySlug === categorySlug;
    })
  );
}

/** Collections that directly include this product — powers "Related Collections" on the product detail page. */
export function getCollectionsContainingProduct(productSlug: string): Collection[] {
  return collections.filter((collection) => collection.productSlugs.includes(productSlug));
}
