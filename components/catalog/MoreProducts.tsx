"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import { useRemoteProducts } from "@/lib/remoteCatalog";

/** How many more cards to add each time the visitor scrolls near the end. */
const STEP = 24;

/**
 * The rest of a product grid after the cards the server sent (bandwidth,
 * Nov 4, 2026 — see lib/remoteCatalog.ts). Renders inside the same grid with
 * the same ProductCard, a screenful ahead of the visitor's scroll, so the
 * page looks exactly as before.
 */
export function MoreProducts({ slugs }: { slugs: string[] }) {
  const products = useRemoteProducts(slugs);
  const [shown, setShown] = useState(0);
  const marker = useRef<HTMLDivElement>(null);
  const total = products?.length ?? 0;

  useEffect(() => {
    const node = marker.current;
    if (!products || !node || shown >= total) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setShown((count) => Math.min(total, count + STEP));
      },
      { rootMargin: "2000px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [products, shown, total]);

  if (!products) return null;
  return (
    <>
      {products.slice(0, shown).map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
      {/* Invisible marker; -mt-6 cancels the grid gap so it adds no space. */}
      {shown < total ? <div ref={marker} aria-hidden="true" className="col-span-full -mt-6 h-px" /> : null}
    </>
  );
}
