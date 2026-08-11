import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CollectionCard } from "@/components/home/CollectionCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { RecommendationBadge } from "@/components/product/RecommendationBadge";
import { SelectionReasonEvidence } from "@/components/product/SelectionReasonEvidence";
import { ProsConsList } from "@/components/product/ProsConsList";
import { products, getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getCategoryBySlug } from "@/lib/data/categories";
import { getCollectionsContainingProduct } from "@/lib/data/collections";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return { title: product.title, description: product.summary };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = getCategoryBySlug(product.categorySlug);
  const relatedProducts = getRelatedProducts(product);
  const relatedCollections = getCollectionsContainingProduct(product.slug);

  const lastVerifiedFormatted = new Date(product.lastVerifiedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const priceRangeLow = Math.min(...product.retailerLinks.map((link) => link.priceLow));
  const priceRangeHigh = Math.max(...product.retailerLinks.map((link) => link.priceHigh));
  const priceFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.retailerLinks[0].currency,
    maximumFractionDigits: 0,
  });

  return (
    <Container className="flex flex-col gap-12 py-10 sm:py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: product.title },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery product={product} />

        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-1.5">
            {product.selectionReasons.map((reason) => (
              <RecommendationBadge key={reason.type} type={reason.type} />
            ))}
          </div>

          <div>
            <h1 className="font-display text-h1 font-semibold tracking-tight text-foreground">{product.title}</h1>
            <p className="mt-3 text-base text-foreground/70">{product.summary}</p>
          </div>

          <ProductBuyBox product={product} />

          <p className="text-xs text-foreground/50">Last verified {lastVerifiedFormatted}</p>
        </div>
      </div>

      <section className="flex flex-col gap-6 border-t border-border pt-10">
        <h2 className="font-display text-h2 font-semibold text-foreground">Why This Made Smart Finds</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {product.selectionReasons.map((reason) => (
            <SelectionReasonEvidence key={reason.type} reason={reason} />
          ))}
        </div>
      </section>

      <section className="border-t border-border pt-10">
        <ProsConsList pros={product.pros} cons={product.cons} />
      </section>

      <section className="border-t border-border pt-10">
        <h2 className="font-display text-h2 font-semibold text-foreground">Product Details</h2>
        <dl className="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <dt className="text-foreground/60">Category</dt>
            <dd className="font-medium text-foreground">
              {category ? (
                <Link href={`/category/${category.slug}`} className="hover:text-brand-600">
                  {category.name}
                </Link>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <dt className="text-foreground/60">Available at</dt>
            <dd className="font-medium text-foreground">
              {product.retailerLinks.map((link) => link.retailer.name).join(", ")}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <dt className="text-foreground/60">Price range</dt>
            <dd className="font-medium text-foreground">
              {priceFormatter.format(priceRangeLow)}–{priceFormatter.format(priceRangeHigh)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
            <dt className="text-foreground/60">Last verified</dt>
            <dd className="font-medium text-foreground">{lastVerifiedFormatted}</dd>
          </div>
        </dl>
      </section>

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
