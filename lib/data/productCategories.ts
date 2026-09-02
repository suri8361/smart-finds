import type { ProductCategoryType } from "@/types/catalog";

export interface ProductCategoryOption {
  value: ProductCategoryType;
  label: string;
  /**
   * The broad nav group (a slug in lib/data/categories.ts) this specific
   * category rolls up into, for /category/[slug] and its related-collections
   * lookup. A few (toys, baby-gear, other) don't cleanly fit an existing
   * group and are left unmapped — products with those categories just won't
   * surface on any of the current /category/[slug] pages.
   */
  group?: string;
}

/**
 * The controlled `category` vocabulary (types/catalog.ts `ProductCategoryType`)
 * with friendly display labels — WHAT a product is. Every clothing/fashion
 * entry here is shared across all of `AudienceType` (lib/data/audiences.ts) —
 * e.g. "dresses" + "women" vs "dresses" + "girls" vs "dresses" +
 * "toddler-girl" — never add an audience-specific category like
 * "girls-dresses".
 */
export const productCategories: ProductCategoryOption[] = [
  // Fashion / clothing
  { value: "dresses", label: "Dresses", group: "fashion-style" },
  { value: "skirts", label: "Skirts", group: "fashion-style" },
  { value: "tops", label: "Tops", group: "fashion-style" },
  { value: "sweaters", label: "Sweaters", group: "fashion-style" },
  { value: "cardigans", label: "Cardigans", group: "fashion-style" },
  { value: "sets", label: "Sets", group: "fashion-style" },
  { value: "jumpsuits", label: "Jumpsuits", group: "fashion-style" },
  { value: "pajamas", label: "Pajamas", group: "fashion-style" },
  { value: "coats-jackets", label: "Coats & Jackets", group: "fashion-style" },
  { value: "shoes", label: "Shoes", group: "fashion-style" },
  { value: "boots", label: "Boots", group: "fashion-style" },
  { value: "sandals", label: "Sandals", group: "fashion-style" },
  { value: "sneakers", label: "Sneakers", group: "fashion-style" },
  { value: "bags", label: "Bags", group: "fashion-style" },
  { value: "accessories", label: "Accessories", group: "fashion-style" },
  // Everything else
  { value: "beauty", label: "Beauty", group: "beauty-personal-care" },
  { value: "home", label: "Home", group: "home-kitchen" },
  { value: "kitchen", label: "Kitchen", group: "home-kitchen" },
  { value: "organization", label: "Organization", group: "home-office" },
  { value: "toys", label: "Toys" },
  { value: "baby-gear", label: "Baby Gear" },
  { value: "school", label: "School", group: "home-office" },
  { value: "electronics", label: "Electronics", group: "tech-electronics" },
  { value: "outdoor", label: "Outdoor", group: "outdoor-camping" },
  { value: "camping", label: "Camping", group: "outdoor-camping" },
  { value: "other", label: "Other" },
];

export function getProductCategoryLabel(value: ProductCategoryType): string | undefined {
  return productCategories.find((category) => category.value === value)?.label;
}

export function getProductCategoryGroup(value: ProductCategoryType): string | undefined {
  return productCategories.find((category) => category.value === value)?.group;
}

/** Specific category values that roll up into a given broad nav group (lib/data/categories.ts) — powers /category/[slug]. */
export function getProductCategoriesInGroup(categoryGroupSlug: string): ProductCategoryType[] {
  return productCategories.filter((category) => category.group === categoryGroupSlug).map((category) => category.value);
}
