import { ChevronDown, SlidersHorizontal } from "lucide-react";

const filters = ["Price", "Retailer", "Recommendation"];

/**
 * Placeholder filter bar. SRS §9 describes category-aware faceted filters
 * (price band, retailer, recommendation label) computed from the real
 * catalog — that facet logic is out of scope for this milestone, so this
 * renders the intended UI (real hover states, no client JS) without any
 * filtering behind it yet. Selecting a chip currently does nothing.
 */
export function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/60">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filter
      </span>
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          {filter}
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
