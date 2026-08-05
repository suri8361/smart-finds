import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CollectionCard } from "@/components/home/CollectionCard";
import { collections } from "@/lib/data/collections";

/** "Featured Collections" homepage section (SRS §3.1, §4 `/collections/[slug]`). */
export function FeaturedCollections() {
  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-8">
        <SectionHeading
          eyebrow="Editor's Selects"
          title="Featured Collections"
          description="Hand-built guides for a specific need, season, or moment — not just a filtered product list."
          action={{ label: "View all collections", href: "/collections" }}
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => (
            <CollectionCard key={collection.slug} collection={collection} />
          ))}
        </div>
      </Container>
    </section>
  );
}
