import type { Collection } from "@/types/catalog";

/**
 * Placeholder "best of" collections. In a later milestone this becomes the
 * `Collection`/`CollectionItem` tables (SRS §11.1) with real editorial copy
 * and ordered product references.
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
