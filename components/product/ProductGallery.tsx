"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { ImageLightbox } from "@/components/product/ImageLightbox";

export interface ProductGalleryProps {
  images: string[];
  alt: string;
  /** Sizing/shape classes for the main image box, e.g. "h-72 w-full sm:h-96" — matches the size the old single-image ProductImage used on this page. */
  className?: string;
}

/**
 * Product detail page's main photo + thumbnail row. Renders nothing when
 * there are no real photos — the page falls back to `ProductImage`'s
 * neutral placeholder in that case (see app/products/[slug]/page.tsx),
 * keeping that existing no-photo behavior untouched.
 *
 * The main image uses `object-contain` on a neutral filled background
 * rather than `object-cover`, so the whole item is always visible instead
 * of being cropped to fill the box — the point of this component. Clicking
 * it opens `ImageLightbox` for a larger view.
 */
export function ProductGallery({ images, alt, className }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) return null;

  const activeSrc = images[Math.min(activeIndex, images.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label="View full-size image"
        className={cn(
          "flex items-center justify-center overflow-hidden rounded-3xl border border-border bg-taupe-200 shadow-card",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- product photos can come from any store's arbitrary domain */}
        <img src={activeSrc} alt={alt} className="h-full w-full object-contain" />
      </button>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, imageIndex) => (
            <button
              key={`${src}-${imageIndex}`}
              type="button"
              onClick={() => setActiveIndex(imageIndex)}
              aria-pressed={imageIndex === activeIndex}
              aria-label={`Show image ${imageIndex + 1} of ${images.length}`}
              className={cn(
                "h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 bg-taupe-200 transition-colors",
                imageIndex === activeIndex ? "border-brand-600 ring-2 ring-brand-500/40" : "border-border hover:border-brand-300"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- product photos can come from any store's arbitrary domain */}
              <img src={src} alt="" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <ImageLightbox
          images={images}
          index={activeIndex}
          alt={alt}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setActiveIndex}
        />
      ) : null}
    </div>
  );
}
