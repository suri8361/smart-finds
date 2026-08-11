"use client";

import { useState } from "react";
import type { Product } from "@/types/catalog";
import { getCategoryBySlug } from "@/lib/data/categories";

// Same warm-neutral palette used for collection covers (lib/utils/collectionAccent.ts),
// duplicated locally rather than imported — this is a product-gallery concern,
// not a collection one, and the values are small enough that sharing a name
// across two unrelated domains would cost more clarity than it'd save.
const galleryTints = [
  "from-taupe-300 to-taupe-200",
  "from-[#cbd6b9] to-[#e7ebdd]",
  "from-[#f0dfb4] to-[#fbf3de]",
  "from-[#c7bbae] to-[#e5dcd0]",
];

/**
 * Placeholder image gallery. There's no real product photography yet, so
 * this renders the same icon-on-gradient placeholder language already used
 * by ProductCard/CollectionCard/the hero collage — honest about being a
 * placeholder (screen readers are told explicitly) rather than pretending to
 * be a photo. The only genuinely interactive piece on the product page, so
 * it's the one client component here.
 */
export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const category = getCategoryBySlug(product.categorySlug);
  const Icon = category?.icon;

  return (
    <div className="flex flex-col gap-3">
      <div
        role="img"
        aria-label={`Placeholder image for ${product.title}`}
        className={`flex h-72 items-center justify-center rounded-3xl bg-linear-to-br shadow-card sm:h-96 ${galleryTints[active]}`}
      >
        {Icon ? <Icon className="h-20 w-20 text-foreground/30" aria-hidden="true" /> : null}
      </div>
      <div className="flex gap-3">
        {galleryTints.map((tint, index) => (
          <button
            key={tint}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show placeholder image ${index + 1} of ${galleryTints.length}`}
            aria-pressed={active === index}
            className={`flex h-16 w-16 flex-1 items-center justify-center rounded-xl bg-linear-to-br transition-opacity sm:h-20 sm:w-20 sm:flex-none ${tint} ${
              active === index
                ? "opacity-100 ring-2 ring-brand-500 ring-offset-2 ring-offset-background"
                : "opacity-60 hover:opacity-90"
            }`}
          >
            {Icon ? <Icon className="h-6 w-6 text-foreground/30" aria-hidden="true" /> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
