import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { collections, getCollectionBySlug } from "@/lib/data/collections";
import { getProductsByCollection } from "@/lib/data/products";
import { collectionAccentClasses } from "@/lib/utils/collectionAccent";

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return {};
  return { title: collection.title, description: collection.description };
}

export default async function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const collectionProducts = getProductsByCollection(collection.slug);

  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Collections" }, { label: collection.title }]} />

      <div
        className={`overflow-hidden rounded-3xl bg-linear-to-br px-8 py-14 sm:px-12 sm:py-20 ${collectionAccentClasses[collection.accent]}`}
      >
        <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-700">Collection</p>
        <h1 className="mt-3 max-w-2xl font-display text-h1 font-semibold tracking-tight text-foreground">
          {collection.title}
        </h1>
        <p className="mt-4 max-w-xl text-base text-foreground/70">{collection.description}</p>
      </div>

      <ProductGrid
        products={collectionProducts}
        emptyTitle="This collection is still being curated"
        emptyDescription="Check back soon for picks in this collection."
      />
    </Container>
  );
}
