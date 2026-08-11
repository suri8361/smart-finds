import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { products } from "@/lib/data/products";

/** "Today's Top Picks" placeholder product grid (build item #6 — placeholder product cards). */
export function TopPicks() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading
          eyebrow="Fresh This Week"
          title="Today's Top Picks"
          description="A mix of styles, price points, and reasons — each one labeled with exactly why it's here."
          action={{ label: "See all picks", href: "/search" }}
        />
        <ProductGrid products={products} />
      </Container>
    </section>
  );
}
