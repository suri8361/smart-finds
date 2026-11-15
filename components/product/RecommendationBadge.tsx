import {
  BadgeCheck,
  BadgePercent,
  Flame,
  Palette,
  Star,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { SelectionReasonType } from "@/types/catalog";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

/** Exported so other places that need the display text (e.g. the admin importer's label picker) don't hand-maintain a second copy. */
export const RECOMMENDATION_LABELS: Record<SelectionReasonType, { text: string; icon: LucideIcon }> = {
  personally_tried: { text: "Tried & True", icon: BadgeCheck },
  chosen_for_look: { text: "Chosen for the Look", icon: Palette },
  popular_pick: { text: "Popular Pick", icon: Flame },
  highly_rated: { text: "Highly Rated", icon: Star },
  community_requested: { text: "Community Requested", icon: Users },
  great_price: { text: "Great Price", icon: BadgePercent },
  trending_find: { text: "Trending Find", icon: TrendingUp },
};

export interface RecommendationBadgeProps {
  type: SelectionReasonType;
  /** "sm" is a slightly more subtle/compact treatment for dense contexts like product cards. Defaults to "md" (unchanged). */
  size?: "sm" | "md";
}

/**
 * Renders one label from the SRS §1.2 controlled vocabulary. "Personally
 * Tried" gets a visually distinct gold treatment from every other,
 * research-based label — that's the one label allowed to imply firsthand
 * experience, so it must never blend in with the rest (SRS §21).
 */
export function RecommendationBadge({ type, size = "md" }: RecommendationBadgeProps) {
  const { text, icon: Icon } = RECOMMENDATION_LABELS[type];
  const isTried = type === "personally_tried";
  const isSm = size === "sm";

  return (
    <Badge
      icon={<Icon className={isSm ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden="true" />}
      className={cn(
        isSm ? "px-2 py-0.5 text-[11px] font-medium" : undefined,
        isTried
          ? "bg-label-tried-bg text-label-tried-fg ring-label-tried-ring"
          : "bg-label-research-bg text-label-research-fg ring-label-research-ring"
      )}
    >
      {text}
    </Badge>
  );
}
