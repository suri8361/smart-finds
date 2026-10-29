import type { Product } from "@/types/catalog";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductCategoryGroup } from "@/lib/data/productCategories";
import { cn } from "@/lib/utils/cn";

export interface ProductImageProps {
  product: Product;
  /** Sizing/shape classes for the image or placeholder container (e.g. "h-40" for a card, "h-72 sm:h-96" for the detail page). */
  className?: string;
  iconClassName?: string;
}

/**
 * Shared product image slot. Renders the real photo when `product.image` is
 * set; otherwise falls back to the same neutral icon-on-stone placeholder
 * used everywhere else on the site before real photography existed (SRS
 * §21) — so a product with no photo yet still looks intentional, not broken.
 *
 * Clothing/fashion photos (audience-bearing categories) use `object-contain`
 * on a neutral filled background instead of `object-cover`, so the whole
 * garment stays visible rather than getting cropped to fill the box —
 * everything else keeps the original fill-the-box behavior, which still
 * looks right for square-ish product shots (mugs, gadgets, etc.).
 */
export function ProductImage({ product, className, iconClassName = "h-10 w-10 text-brand-300" }: ProductImageProps) {
  const categoryGroupSlug = getProductCategoryGroup(product.category);
  const categoryGroup = categoryGroupSlug ? getCategoryBySlug(categoryGroupSlug) : undefined;

  if (product.image) {
    const isFashion = categoryGroupSlug === "fashion-style" || categoryGroupSlug === "shabbos-elegant";
    return (
      <div className={cn("overflow-hidden bg-taupe-200", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- product photos can come from any store's arbitrary domain, so next/image's fixed remotePatterns allowlist isn't practical here. */}
        <img
          src={product.image}
          alt={product.name}
          className={cn("h-full w-full", isFashion ? "object-contain" : "object-cover")}
        />
      </div>
    );
  }

  const Icon = categoryGroup?.icon;

  return (
    <div className={cn("flex items-center justify-center bg-taupe-200", className)}>
      {Icon ? <Icon className={iconClassName} aria-hidden="true" /> : null}
    </div>
  );
}
