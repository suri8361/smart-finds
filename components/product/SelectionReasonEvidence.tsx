import { Star } from "lucide-react";
import type { ProductSelectionReason } from "@/types/catalog";
import { RecommendationBadge } from "@/components/product/RecommendationBadge";

/**
 * One card in the "Why This Made Smart Finds" section — the label plus its
 * required evidence (SRS §1.2 rule 3). `evidence.note` is rendered verbatim,
 * never rewritten, since that text is what was vetted against the
 * no-overclaiming rules when it was authored. The rating badge is a visual
 * restatement of `evidence.rating` (not new information), not a duplicate of
 * the note text, so it doesn't read as repetitive.
 */
export function SelectionReasonEvidence({ reason }: { reason: ProductSelectionReason }) {
  const { rating } = reason.evidence;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-card">
      <RecommendationBadge type={reason.type} />
      {rating ? (
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
          {rating.value.toFixed(1)}
          <span className="font-normal text-foreground/60">
            ({rating.count.toLocaleString()} ratings on {rating.source})
          </span>
        </div>
      ) : null}
      <p className="text-sm text-foreground/70">{reason.evidence.note}</p>
    </div>
  );
}
