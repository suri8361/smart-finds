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

const LABELS: Record<SelectionReasonType, { text: string; icon: LucideIcon }> = {
  personally_tried: { text: "Personally Tried", icon: BadgeCheck },
  chosen_for_look: { text: "Chosen for the Look", icon: Palette },
  popular_pick: { text: "Popular Pick", icon: Flame },
  highly_rated: { text: "Highly Rated", icon: Star },
  community_requested: { text: "Community Requested", icon: Users },
  great_price: { text: "Great Price", icon: BadgePercent },
  trending_find: { text: "Trending Find", icon: TrendingUp },
};

/**
 * Renders one label from the SRS §1.2 controlled vocabulary. "Personally
 * Tried" gets a visually distinct gold treatment from every other,
 * research-based label — that's the one label allowed to imply firsthand
 * experience, so it must never blend in with the rest (SRS §21).
 */
export function RecommendationBadge({ type }: { type: SelectionReasonType }) {
  const { text, icon: Icon } = LABELS[type];
  const isTried = type === "personally_tried";

  return (
    <Badge
      icon={<Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      className={cn(
        isTried
          ? "bg-label-tried-bg text-label-tried-fg ring-label-tried-ring"
          : "bg-label-research-bg text-label-research-fg ring-label-research-ring"
      )}
    >
      {text}
    </Badge>
  );
}
