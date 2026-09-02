import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { getFeaturedProducts } from "@/lib/data/products";

/** "Today's Top Picks" — shows products with `featured: true` (lib/data/products.ts). */
export function TopPicks() {
  const featuredProducts = getFeaturedProducts();

  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading
          eyebrow="Fresh This Week"
          title="Today's Top Picks"
          description="Worth checking out this week."
          action={{ label: "See all picks", href: "/search" }}
        />
        <ProductGrid
          products={featuredProducts}
          emptyTitle="No top picks yet"
          emptyDescription="Mark a product featured: true in lib/data/products.ts to feature it here."
        />
      </Container>
    </section>
  );
}
