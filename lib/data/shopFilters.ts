import type { AudienceType, KidsForType, Product, ProductCategoryType } from "@/types/catalog";
import { productCategories } from "@/lib/data/productCategories";
import { holidayChips } from "@/lib/data/holidays";

/**
 * Shopper / type / holiday filters for category pages and the header menus.
 * Everything is computed from the product data, and a chip with no products
 * behind it is never shown.
 */

const KID_AUDIENCES: AudienceType[] = ["girls", "boys", "toddler-girl", "toddler-boy", "baby-girl", "baby-boy", "unisex-kids"];
const GIRL_AUDIENCES: AudienceType[] = ["girls", "toddler-girl", "baby-girl"];
const BOY_AUDIENCES: AudienceType[] = ["boys", "toddler-boy", "baby-boy"];
/** Item types that are kids finds even without a kids audience. */
const KID_CATEGORIES: ProductCategoryType[] = ["toys", "baby-gear"];

/** Kids clothing (a kids audience) or a toy / baby-gear find. */
export function isKidsFind(product: Product): boolean {
  return (!!product.audience && KID_AUDIENCES.includes(product.audience)) || KID_CATEGORIES.includes(product.category);
}

/**
 * Girls / boys / both for a kids find (Sara, Nov 2, 2026: the Kids section is split into Girls and Boys).
 * Uses `kidsFor` when the data has it; otherwise works it out from `audience` (unsure → both).
 */
export function kidsForOf(product: Product): KidsForType | undefined {
  if (!isKidsFind(product)) return undefined;
  if (product.kidsFor === "girls" || product.kidsFor === "boys" || product.kidsFor === "both") return product.kidsFor;
  if (product.audience && GIRL_AUDIENCES.includes(product.audience)) return "girls";
  if (product.audience && BOY_AUDIENCES.includes(product.audience)) return "boys";
  return "both";
}

/** Shows under Girls ("girls" or "both"). */
export const isForGirls = (product: Product) => {
  const who = kidsForOf(product);
  return who === "girls" || who === "both";
};

/** Shows under Boys ("boys" or "both"). */
export const isForBoys = (product: Product) => {
  const who = kidsForOf(product);
  return who === "boys" || who === "both";
};

export interface ShopperFilter {
  value: string;
  label: string;
  /** Kids sub-filters show in a second row once Kids (or one of them) is picked. */
  kids?: boolean;
  match: (product: Product) => boolean;
}

export const shopperFilters: ShopperFilter[] = [
  { value: "women", label: "Women", match: (p) => p.audience === "women" || p.audience === "unisex-adult" },
  { value: "maternity", label: "Maternity", match: (p) => p.maternity === true },
  { value: "men", label: "Men", match: (p) => p.audience === "men" || p.audience === "unisex-adult" },
  { value: "kids", label: "Kids", match: (p) => !!p.audience && KID_AUDIENCES.includes(p.audience) },
  { value: "girls", label: "Girls", kids: true, match: isForGirls },
  { value: "boys", label: "Boys", kids: true, match: isForBoys },
  {
    value: "baby-toddler",
    label: "Baby & Toddler",
    kids: true,
    match: (p) => !!p.audience && ["toddler-girl", "toddler-boy", "baby-girl", "baby-boy"].includes(p.audience),
  },
];

export function getShopperFilter(value: string | undefined): ShopperFilter | undefined {
  return value ? shopperFilters.find((filter) => filter.value === value) : undefined;
}

export function filterByShopper(products: Product[], value: string | undefined): Product[] {
  const filter = getShopperFilter(value);
  return filter ? products.filter(filter.match) : products;
}

export function filterByType(products: Product[], value: string | undefined): Product[] {
  return value ? products.filter((product) => product.category === value) : products;
}

export function filterByHoliday(products: Product[], value: string | undefined): Product[] {
  return value ? products.filter((product) => product.holidays?.includes(value as never)) : products;
}

/** Item types present in `products`, in the vocabulary's order, with counts. */
export function typeOptions(products: Product[]): { value: ProductCategoryType; label: string; count: number }[] {
  return productCategories
    .map((category) => ({
      value: category.value,
      label: category.label,
      count: products.filter((product) => product.category === category.value).length,
    }))
    .filter((option) => option.count > 0);
}

/** Holidays (with their own chip) present in `products`, in calendar order. */
export function holidayOptions(products: Product[]): { value: string; label: string; count: number }[] {
  return holidayChips
    .map((holiday) => ({
      value: holiday.value,
      label: holiday.label,
      count: products.filter((product) => product.holidays?.includes(holiday.value)).length,
    }))
    .filter((option) => option.count > 0);
}

/** Shopper chips with products behind them. */
export function shopperOptions(products: Product[]): (ShopperFilter & { count: number })[] {
  return shopperFilters
    .map((filter) => ({ ...filter, count: products.filter(filter.match).length }))
    .filter((option) => option.count > 0);
}
