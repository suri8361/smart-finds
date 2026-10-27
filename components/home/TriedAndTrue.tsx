import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { getProductsByCategoryGroup } from "@/lib/data/products";

/** Homepage row: the newest finds Sara has tried herself (recommendationLabel "personally_tried"). */
export function TriedAndTrue() {
  const products = getProductsByCategoryGroup("tried-true").slice(0, 8);
  if (products.length === 0) return null;

  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading
          eyebrow="Sara's Own"
          title="Tried & True"
          description="Things Sara has bought and used herself."
          action={{ label: "See all Tried & True", href: "/category/tried-true" }}
        />
        <ProductGrid products={products} />
      </Container>
    </section>
  );
}
