"use client";

import { useSyncExternalStore } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/types/catalog";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFavorites } from "@/lib/favorites";

const noopSubscribe = () => () => {};

/** Saved products, read from this browser's local storage. Most recently saved first. */
export function FavoritesList({ products }: { products: Product[] }) {
  const { favorites } = useFavorites();
  // false during server render / hydration, true once running in the browser —
  // avoids flashing the "no favorites" state before local storage is read.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  if (!hydrated) {
    return <div className="h-40 animate-pulse rounded-2xl bg-surface-muted" aria-hidden="true" />;
  }

  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const saved = favorites.map((slug) => bySlug.get(slug)).filter((product): product is Product => Boolean(product));

  if (saved.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No favorites yet"
        description="Tap the heart on any find to save it here. Favorites are kept on this device, no account needed."
        action={{ label: "Browse finds", href: "/search" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-foreground/60">
        {saved.length} saved {saved.length === 1 ? "find" : "finds"} · kept on this device
      </p>
      <ProductGrid products={saved} />
    </div>
  );
}
