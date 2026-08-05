import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryTile } from "@/components/home/CategoryTile";
import { categories } from "@/lib/data/categories";

/**
 * "Shop by Category" homepage section (SRS §7.3). Has `id="shop-by-category"`
 * so the Hero CTA and the mobile tab bar's Categories tab can deep-link here
 * with a real, working anchor instead of a not-yet-built category index page.
 */
export function ShopByCategory() {
  return (
    <section id="shop-by-category" className="scroll-mt-20 bg-surface-muted py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading
          eyebrow="Browse"
          title="Shop by Category"
          description="Every category page opens with hand-picked top picks before the full, filterable grid."
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <CategoryTile key={category.slug} category={category} />
          ))}
        </div>
      </Container>
    </section>
  );
}
