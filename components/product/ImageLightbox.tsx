"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export interface ImageLightboxProps {
  images: string[];
  index: number;
  alt: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

// Same portal-mount pattern as MobileMenu (components/layout/MobileMenu.tsx):
// `document` doesn't exist during server rendering, so the portal is
// deferred to after the client mounts via useSyncExternalStore rather than
// an effect-driven setState.
const subscribe = () => () => {};

/**
 * Full-viewport image lightbox, portaled to `document.body` so it always
 * sits above the rest of the page regardless of any ancestor stacking
 * context. Closes on Escape, backdrop click, or the close button; arrow
 * keys and on-screen prev/next buttons navigate when there's more than one
 * image. Never opens a new tab — this is purely a client-side overlay.
 */
export function ImageLightbox({ images, index, alt, onClose, onNavigate }: ImageLightboxProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft" && images.length > 1) {
        onNavigate((index - 1 + images.length) % images.length);
      } else if (event.key === "ArrowRight" && images.length > 1) {
        onNavigate((index + 1) % images.length);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, index, onClose, onNavigate]);

  if (!mounted) return null;

  const src = images[index];
  if (!src) return null;

  const goToPrevious = () => onNavigate((index - 1 + images.length) % images.length);
  const goToNext = () => onNavigate((index + 1) % images.length);

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-6 w-6" aria-hidden="true" />
      </button>

      {images.length > 1 ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goToPrevious();
          }}
          aria-label="Previous image"
          className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
      ) : null}

      {/* eslint-disable-next-line @next/next/no-img-element -- product photos can come from any store's arbitrary domain */}
      <img
        src={src}
        alt={alt}
        className="max-h-full max-w-full object-contain"
        onClick={(event) => event.stopPropagation()}
      />

      {images.length > 1 ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            goToNext();
          }}
          aria-label="Next image"
          className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      ) : null}

      {images.length > 1 ? (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
          {index + 1} / {images.length}
        </p>
      ) : null}
    </div>
  );

  return createPortal(modal, document.body);
}
