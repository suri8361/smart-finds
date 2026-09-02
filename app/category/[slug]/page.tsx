import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FilterBar } from "@/components/catalog/FilterBar";
import { SortDropdown } from "@/components/catalog/SortDropdown";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CollectionCard } from "@/components/home/CollectionCard";
import { categories, getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategoryGroup } from "@/lib/data/products";
import { getCollectionsRelatedToCategory } from "@/lib/data/collections";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return { title: category.name, description: category.description };
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryProducts = getProductsByCategoryGroup(category.slug);
  const relatedCollections = getCollectionsRelatedToCategory(category.slug);
  const Icon = category.icon;

  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      <div className="max-w-2xl">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-taupe-200 text-brand-600">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-h1 font-semibold tracking-tight text-foreground">{category.name}</h1>
        <p className="mt-3 text-base text-foreground/70">{category.description}</p>
      </div>

      <div className="flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar />
        <SortDropdown />
      </div>

      <ProductGrid
        products={categoryProducts}
        emptyTitle="No picks in this category yet"
        emptyDescription="We're still curating this one — check back soon or browse another category."
      />

      <div className="flex flex-col gap-6 border-t border-border pt-10">
        <h2 className="font-display text-h3 font-semibold text-foreground">Related Collections</h2>
        {relatedCollections.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCollections.map((collection) => (
              <CollectionCard key={collection.slug} collection={collection} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground/50">No related collections yet — check back soon.</p>
        )}
      </div>
    </Container>
  );
}
