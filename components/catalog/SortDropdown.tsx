import { ArrowUpDown } from "lucide-react";

const sortOptions = ["Editor's Pick", "Price: Low to High", "Price: High to Low", "Newest", "Most Popular"];

/**
 * Placeholder sort control — a native <select> so it's fully keyboard/
 * screen-reader accessible with zero client JS. Not yet wired to actually
 * reorder the grid; SRS §9's default is "Editor's Pick" (a curated manual
 * order), which is what real sorting logic will need to preserve as default.
 */
export function SortDropdown() {
  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80">
      <ArrowUpDown className="h-4 w-4 text-foreground/50" aria-hidden="true" />
      <span className="sr-only">Sort by</span>
      <select
        defaultValue={sortOptions[0]}
        className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      >
        {sortOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
