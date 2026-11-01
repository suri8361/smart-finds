import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Native GET form — submits to `/search?q=...` without any client-side JS.
 * The /search page reads `q` and filters products in the browser.
 */
export function SearchBar({ className }: { className?: string }) {
  return (
    <form action="/search" method="GET" role="search" className={cn("w-full", className)}>
      <label htmlFor="site-search" className="sr-only">
        Search Smart Finds
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40"
          aria-hidden="true"
        />
        <input
          id="site-search"
          name="q"
          type="search"
          placeholder="Search curated finds…"
          className="h-10 w-full rounded-full border border-border bg-surface-muted pl-9 pr-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>
    </form>
  );
}
