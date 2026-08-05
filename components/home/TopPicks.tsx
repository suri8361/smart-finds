import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
