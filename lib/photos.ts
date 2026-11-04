import type { Product } from "@/types/catalog";
import { PHOTO_BASE } from "@/lib/config/data-source";

/**
 * Bandwidth (Nov 4, 2026): every photo saved as "/finds/x.jpg" is loaded from
 * the data branch on GitHub Pages (PHOTO_BASE, free), never from this site.
 * Netlify bills each byte it sends, and these photos were most of it. Every
 * photo in public/finds is also on the data branch (sfdata.py pull/push keep
 * them in step), so the copy in this deploy is only a backup.
 * Store photos (https://...) are left exactly as they are.
 */
export function remotePhoto(src: string | undefined): string | undefined {
  if (!src || !src.startsWith("/") || src.startsWith("//")) return src;
  return PHOTO_BASE + src.split("/").map(encodeURIComponent).join("/");
}

/** The same product with its photo and gallery pointed at GitHub Pages. */
export function withRemotePhotos(product: Product): Product {
  return {
    ...product,
    image: remotePhoto(product.image),
    images: product.images?.map((src) => remotePhoto(src) ?? src),
  };
}
