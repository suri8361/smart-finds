import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { retailers, retailerBySlug } from "@/lib/data/retailers";
import { getProductsByStore } from "@/lib/data/products";

export function generateStaticParams() {
  return retailers.map((retailer) => ({ slug: retailer.slug }));
}

export async function generateMetadata({ params }: PageProps<"/retailers/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const retailer = retailerBySlug[slug];
  if (!retailer) return {};
  return { title: `${retailer.name} Finds`, description: `Every Smart Finds pick from ${retailer.name}.` };
}

/** Simple per-store listing — every public product whose store matches this retailer. */
export default async function RetailerPage({ params }: PageProps<"/retailers/[slug]">) {
  const { slug } = await params;
  const retailer = retailerBySlug[slug];

  if (!retailer) {
    notFound();
  }

  const storeProducts = getProductsByStore(retailer.name);

  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Retailers" }, { label: retailer.name }]} />

      <div className="max-w-2xl">
        <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600">Shop by retailer</p>
        <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-foreground">{retailer.name} Finds</h1>
        <p className="mt-3 text-base text-foreground/70">
          Our picks from {retailer.name}. Every link opens {retailer.name}&apos;s own site, where you check out.
        </p>
      </div>

      <ProductGrid
        products={storeProducts}
        emptyTitle={`No ${retailer.name} finds yet`}
        emptyDescription="Check back soon — we're always adding new finds."
      />
    </Container>
  );
}
