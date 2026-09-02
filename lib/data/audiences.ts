import type { AudienceType } from "@/types/catalog";

export interface AudienceOption {
  value: AudienceType;
  label: string;
}

/**
 * The controlled `audience` vocabulary (types/catalog.ts `AudienceType`) with
 * friendly display labels — who a clothing/fashion product is for. Keep
 * `category` (lib/data/categories.ts) describing WHAT the item is; never fold
 * age/gender into a category slug — that's what this field is for.
 */
export const audiences: AudienceOption[] = [
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "girls", label: "Girls" },
  { value: "boys", label: "Boys" },
  { value: "toddler-girl", label: "Toddler Girl" },
  { value: "toddler-boy", label: "Toddler Boy" },
  { value: "baby-girl", label: "Baby Girl" },
  { value: "baby-boy", label: "Baby Boy" },
  { value: "unisex-kids", label: "Unisex Kids" },
  { value: "unisex-adult", label: "Unisex Adult" },
];

export function getAudienceLabel(value: AudienceType | undefined): string | undefined {
  if (!value) return undefined;
  return audiences.find((audience) => audience.value === value)?.label;
}
