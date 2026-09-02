"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/components/admin/adminFormPrimitives";

export interface GalleryImageManagerProps {
  /** Every known candidate photo — scraped results (Add flow) or the product's existing photos (Edit flow), plus anything added manually below. */
  images: string[];
  /** Adds a manually-typed URL to `images`. Caller is responsible for dedup/state. */
  onAddImage: (url: string) => void;
  /** The primary/card image — click a tile's photo to set it. */
  primary?: string;
  onSelectPrimary: (url: string) => void;
  /** Additional images explicitly opted into the gallery (never includes unrelated page images automatically — only what's checked here gets saved). */
  galleryImages: string[];
  onToggleGalleryImage: (url: string) => void;
}

/**
 * Thumbnail grid + manual URL entry for managing a product's photos, shared
 * by the Add Product importer and Edit Product form. Some URLs will fail to
 * load in the browser (hotlink protection, referrer checks, etc.) — those
 * are just dropped from the grid via onError rather than shown broken.
 *
 * When candidates come from the scraper (lib/admin/scrapeProduct.ts) the
 * grid order is already ranked largest-likely-first from URL size hints —
 * this doesn't re-sort on top of that (would jump thumbnails around as each
 * one loads at a different time). Instead each tile reports its real,
 * browser-measured pixel dimensions once loaded, so you can confirm which
 * one is actually the highest resolution before picking.
 *
 * Two independent choices per tile: clicking the photo sets it as the
 * PRIMARY (card) image, one at a time; the checkbox opts it into the
 * product's photo GALLERY, any number at a time. Nothing is ever added to
 * the gallery automatically — only what's explicitly checked here is saved,
 * so unrelated page images (recommendations, banners, etc.) never sneak in.
 * The primary image is always implicitly part of the gallery too, so its
 * checkbox shows checked-and-disabled rather than letting it be excluded.
 *
 * The "Add image URL" field covers photos that weren't discovered
 * automatically — most useful when editing a product with no fresh scrape
 * to pick from, but available in both flows.
 */
export function GalleryImageManager({
  images,
  onAddImage,
  primary,
  onSelectPrimary,
  galleryImages,
  onToggleGalleryImage,
}: GalleryImageManagerProps) {
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const [dimensions, setDimensions] = useState<Record<string, string>>({});
  const [manualUrl, setManualUrl] = useState("");

  const visible = images.filter((src) => !broken.has(src));

  function handleAddManualUrl() {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;
    onAddImage(trimmed);
    setManualUrl("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          value={manualUrl}
          onChange={(event) => setManualUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAddManualUrl();
            }
          }}
          placeholder="Paste an image URL to add it manually…"
          className={inputClass}
        />
        <Button type="button" variant="outline" size="sm" onClick={handleAddManualUrl} className="shrink-0">
          Add
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-foreground/50">No usable images to show.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {visible.map((src) => {
            const isPrimary = primary === src;
            const inGallery = isPrimary || galleryImages.includes(src);

            return (
              <div
                key={src}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border-2 bg-surface-muted transition-colors",
                  isPrimary ? "border-brand-600 ring-2 ring-brand-500/40" : "border-border hover:border-brand-300"
                )}
              >
                <button type="button" onClick={() => onSelectPrimary(src)} className="block h-full w-full" aria-pressed={isPrimary}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary remote store domains, same rationale as ProductImage */}
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={() => setBroken((prev) => new Set(prev).add(src))}
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } = event.currentTarget;
                      setDimensions((prev) => ({ ...prev, [src]: `${naturalWidth}×${naturalHeight}` }));
                    }}
                  />
                </button>

                {isPrimary ? (
                  <span className="pointer-events-none absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Primary
                  </span>
                ) : null}

                <label
                  className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded bg-black/60"
                  title={isPrimary ? "Primary image (always included in the gallery)" : "Include in photo gallery"}
                >
                  <input
                    type="checkbox"
                    checked={inGallery}
                    disabled={isPrimary}
                    onChange={() => onToggleGalleryImage(src)}
                    className="h-3.5 w-3.5 accent-brand-600"
                  />
                  <span className="sr-only">Include in photo gallery</span>
                </label>

                {dimensions[src] ? (
                  <span className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {dimensions[src]}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
