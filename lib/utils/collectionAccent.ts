import type { Collection } from "@/types/catalog";

/**
 * Curated warm-toned gradients (not Tailwind's default candy-bright palette)
 * so collection covers read as neutral editorial art rather than app icons.
 * Keyed by `Collection["accent"]` from types/catalog.ts. Shared by
 * CollectionCard (homepage tile cover) and the collection detail page banner
 * so the two never drift out of sync.
 *
 * `brand` and `rose` were previously peach/dusty-rose — read as "women's
 * boutique" rather than general-audience shopping. `brand` now uses the
 * neutral `taupe` scale (app/globals.css) instead of any terracotta tint —
 * a paler terracotta still reads "warm boutique" at cover size, so this
 * needed a different hue family, not just a lighter one. `rose` stays the
 * warm-taupe swap from the previous pass.
 */
export const collectionAccentClasses: Record<Collection["accent"], string> = {
  brand: "from-taupe-300 via-taupe-200 to-transparent", // neutral stone
  amber: "from-[#f0dfb4] via-[#fbf3de] to-transparent", // warm gold
  emerald: "from-[#cbd6b9] via-[#e7ebdd] to-transparent", // sage
  rose: "from-[#c7bbae] via-[#e5dcd0] to-transparent", // warm taupe
};
