import type { OccasionType } from "@/types/catalog";

export interface OccasionOption {
  value: OccasionType;
  label: string;
}

/**
 * The controlled `occasion` vocabulary (types/catalog.ts `OccasionType`) with
 * friendly display labels — WHEN/how a clothing/fashion product is
 * typically worn. Keep this independent of `category` (lib/data/productCategories.ts,
 * WHAT the item is) and `audience` (lib/data/audiences.ts, WHO it's for) —
 * all three combine freely, e.g. Women + Skirts + Shabbos.
 */
export const occasions: OccasionOption[] = [
  { value: "weekday", label: "Weekday" },
  { value: "shabbos", label: "Shabbos" },
  { value: "both", label: "Weekday & Shabbos" },
];

export function getOccasionLabel(value: OccasionType | undefined): string | undefined {
  if (!value) return undefined;
  return occasions.find((occasion) => occasion.value === value)?.label;
}
