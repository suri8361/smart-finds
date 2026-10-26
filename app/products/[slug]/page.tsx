import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CollectionCard } from "@/components/home/CollectionCard";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductGallery } from "@/components/product/ProductGallery";
import { SizeMeasurementsTable } from "@/components/product/SizeMeasurementsTable";
import { RecommendationBadge } from "@/components/product/RecommendationBadge";
import { publicProducts, getPublicProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getProductCategoryLabel, getProductCategoryGroup } from "@/lib/data/productCategories";
import { getCollectionsContainingProduct } from "@/lib/data/collections";
import { getAudienceLabel } from "@/lib/data/audiences";
import { getOccasionLabel } from "@/lib/data/occasions";
import { ProductPrice } from "@/components/product/ProductPrice";
import { FavoriteButton } from "@/components/product/FavoriteButton";
import { getOutboundUrl } from "@/lib/affiliate";

export function generateStaticParams() {
  return publicProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getPublicProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categoryLabel = getProductCategoryLabel(product.category) ?? product.category;
  const categoryGroupSlug = getProductCategoryGroup(product.category);
  const categoryGroup = categoryGroupSlug ? getCategoryBySlug(categoryGroupSlug) : undefined;
  const relatedProducts = getRelatedProducts(product);
  const relatedCollections = getCollectionsContainingProduct(product.slug);
  const galleryImages = product.images && product.images.length > 0 ? product.images : product.image ? [product.image] : [];

  return (
    <Container className="flex flex-col gap-12 py-10 sm:py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          ...(categoryGroup ? [{ label: categoryGroup.name, href: `/category/${categoryGroup.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {galleryImages.length > 0 ? (
          <ProductGallery images={galleryImages} alt={product.name} className="h-72 w-full sm:h-96" />
        ) : (
          <ProductImage product={product} className="h-72 w-full rounded-3xl shadow-card sm:h-96" iconClassName="h-20 w-20 text-brand-300" />
        )}

        <div className="flex flex-col gap-6">
          <div>
            <RecommendationBadge type={product.recommendationLabel} />
          </div>

          <div>
            <h1 className="font-display text-h1 font-semibold tracking-tight text-foreground">{product.name}</h1>
            <p className="mt-3 text-base text-foreground/70">{product.description}</p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-muted p-5">
            <div>
              <ProductPrice product={product} size="lg" />
              <p className="mt-1 text-sm text-foreground/60">{product.store}</p>
            </div>

            <Button href={getOutboundUrl(product)} target="_blank" rel="noopener noreferrer" size="lg">
              View Find
            </Button>
            <FavoriteButton slug={product.slug} name={product.name} variant="full" />

            <p className="text-xs leading-relaxed text-foreground/50">
              Some links on Smart Finds are{" "}
              <Link
                href="/legal/affiliate-disclosure"
                className="underline decoration-foreground/30 underline-offset-2 transition-colors hover:text-foreground/75"
              >
                affiliate links
              </Link>
              . If you purchase through them, we may earn a commission at no extra cost to you.
            </p>
          </div>
        </div>
      </div>

      <section className="border-t border-border pt-10">
        <h2 className="font-display text-h2 font-semibold text-foreground">Product Details</h2>
        <dl className="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <dt className="text-foreground/60">Category</dt>
            <dd className="font-medium text-foreground">
              {categoryGroup ? (
                <Link href={`/category/${categoryGroup.slug}`} className="hover:text-brand-600">
                  {categoryLabel}
                </Link>
              ) : (
                categoryLabel
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <dt className="text-foreground/60">Store</dt>
            <dd className="font-medium text-foreground">{product.store}</dd>
          </div>
          {product.audience ? (
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
              <dt className="text-foreground/60">Audience</dt>
              <dd className="font-medium text-foreground">{getAudienceLabel(product.audience)}</dd>
            </div>
          ) : null}
          {product.occasion ? (
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
              <dt className="text-foreground/60">Occasion</dt>
              <dd className="font-medium text-foreground">{getOccasionLabel(product.occasion)}</dd>
            </div>
          ) : null}
          {product.sizes && product.sizes.length > 0 ? (
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
              <dt className="text-foreground/60">Sizes</dt>
              <dd className="font-medium text-foreground">{product.sizes.join(", ")}</dd>
            </div>
          ) : null}
          {product.colors && product.colors.length > 0 ? (
            <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
              <dt className="text-foreground/60">Colors</dt>
              <dd className="font-medium text-foreground">{product.colors.join(", ")}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      {product.sizeMeasurements && product.sizeMeasurements.length > 0 ? (
        <SizeMeasurementsTable sizeMeasurements={product.sizeMeasurements} sizeNote={product.sizeNote} />
      ) : null}

      <section className="flex flex-col gap-6 border-t border-border pt-10">
        <h2 className="font-display text-h2 font-semibold text-foreground">Related Products</h2>
        <ProductGrid
          products={relatedProducts}
          emptyTitle="No related products yet"
          emptyDescription="Check back soon — we're always adding new finds in this category."
        />
      </section>

      <section className="flex flex-col gap-6 border-t border-border pt-10">
        <h2 className="font-display text-h2 font-semibold text-foreground">Related Collections</h2>
        {relatedCollections.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCollections.map((collection) => (
              <CollectionCard key={collection.slug} collection={collection} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground/50">No related collections yet — check back soon.</p>
        )}
      </section>
    </Container>
  );
}
