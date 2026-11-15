"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils/cn";

export interface FavoriteButtonProps {
  slug: string;
  name: string;
  className?: string;
  /** "icon" = round heart overlay (cards); "full" = heart + label (product page). */
  variant?: "icon" | "full";
}

/** Heart toggle that saves a product to Favorites in this browser (no login). */
export function FavoriteButton({ slug, name, className, variant = "icon" }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(slug);
  const label = saved ? `Remove ${name} from favorites` : `Save ${name} to favorites`;

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggleFavorite(slug)}
        aria-pressed={saved}
        aria-label={label}
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-md border border-foreground/25 px-7 text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-foreground/50 hover:bg-surface",
          className
        )}
      >
        <Heart className={cn("h-4 w-4", saved ? "fill-brand-600 text-brand-600" : "")} aria-hidden="true" />
        {saved ? "Saved to Favorites" : "Save to Favorites"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? "Saved — tap to remove" : "Save to favorites"}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 shadow-card backdrop-blur transition-colors hover:bg-surface",
        className
      )}
    >
      <Heart className={cn("h-[18px] w-[18px]", saved ? "fill-brand-600 text-brand-600" : "text-foreground/70")} aria-hidden="true" />
    </button>
  );
}
