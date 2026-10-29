import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CategoryTile } from "@/components/home/CategoryTile";
import { getHomeCategories } from "@/lib/data/home";

/**
 * "Shop by Category" homepage section. Has `id="shop-by-category"` so the
 * Hero CTA and the mobile tab bar's Categories tab can deep-link here.
 * Categories with only a handful of finds are left off the home page (they're
 * still in the menu, the footer and /categories).
 */
export function ShopByCategory() {
  const entries = getHomeCategories();
  if (entries.length === 0) return null;
  return (
    <section id="shop-by-category" className="scroll-mt-20 bg-surface-muted py-14 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading
          eyebrow="Browse"
          title="Shop by Category"
          action={{ label: "All categories", href: "/categories" }}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
          {entries.map((entry) => (
            <CategoryTile key={entry.category.slug} entry={entry} />
          ))}
        </div>
      </Container>
    </section>
  );
}
