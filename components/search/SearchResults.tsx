"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import type { Product } from "@/types/catalog";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { searchProducts } from "@/lib/search";
import { MessageUsCallout } from "@/components/contact/MessageUs";

const SUGGESTIONS = ["Skirts", "Dresses", "Shoes", "Kitchen", "SHEIN", "Temu"];

/** Search box + live results, filtered in the browser as you type. The query is kept in the URL (?q=) so results can be shared. */
export function SearchResults({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  // Header search submits a new ?q= while this page is open — follow it.
  const [lastInitial, setLastInitial] = useState(initialQuery);
  if (initialQuery !== lastInitial) {
    setLastInitial(initialQuery);
    setQuery(initialQuery);
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query);
    else url.searchParams.delete("q");
    window.history.replaceState(window.history.state, "", url.toString());
  }, [query]);

  const results = useMemo(() => searchProducts(products, query), [products, query]);
  const hasQuery = query.trim().length > 0;
  // No or few matches: put the "Looking for something specific?" card right under the count.
  const fewResults = hasQuery && results.length < 4;

  return (
    <div className="flex flex-col gap-8">
      <form role="search" onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-3">
        <label htmlFor="search-page-input" className="sr-only">
          Search Smart Finds
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40"
            aria-hidden="true"
          />
          <input
            id="search-page-input"
            type="search"
            inputMode="search"
            enterKeyHint="search"
            autoComplete="off"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by product, store or category…"
            className="h-12 w-full rounded-full border border-border bg-surface pl-12 pr-12 text-base text-foreground shadow-card placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 [&::-webkit-search-cancel-button]:hidden"
          />
          {hasQuery ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-foreground/50 hover:bg-surface-muted hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setQuery(suggestion)}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-foreground/70 transition-colors hover:border-brand-300 hover:text-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      <p className="text-sm text-foreground/60" aria-live="polite">
        {hasQuery
          ? `${results.length} ${results.length === 1 ? "find" : "finds"} for “${query.trim()}”`
          : `All ${results.length} finds`}
      </p>

      {fewResults ? <MessageUsCallout compact /> : null}

      <ProductGrid
        products={results}
        emptyTitle="No finds match that yet"
        emptyDescription="Try a shorter word, a store name like SHEIN, or a category like skirts."
      />

      {fewResults ? null : <MessageUsCallout className="mt-4" />}
    </div>
  );
}
