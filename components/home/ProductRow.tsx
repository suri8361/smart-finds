import type { Product } from "@/types/catalog";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { PriceNote } from "@/components/product/PriceNote";
import { cn } from "@/lib/utils/cn";

/** A curated home page row: heading + a 2-up (phone) / 4-up (desktop) grid of compact product cards. */
export function ProductRow({
  eyebrow,
  title,
  description,
  action,
  products,
  tinted = false,
  priceNote = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  products: Product[];
  tinted?: boolean;
  /** Show the small "prices may change" line under this row (used once on the home page). */
  priceNote?: boolean;
}) {
  if (products.length < 4) return null;
  return (
    <section className={cn("py-14 sm:py-20", tinted && "bg-surface-muted")}>
      <Container className="flex flex-col gap-8">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} action={action} />
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} compact />
          ))}
        </div>
        {priceNote ? <PriceNote className="-mt-4 text-center sm:text-left" /> : null}
      </Container>
    </section>
  );
}
