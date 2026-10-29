import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/product/ProductImage";
import { products } from "@/lib/data/products";
import { getProductCategoryLabel } from "@/lib/data/productCategories";
import { getAudienceLabel } from "@/lib/data/audiences";
import { formatPrice } from "@/lib/utils/formatPrice";

export const metadata: Metadata = {
  title: "Manage Products (Dev Tool)",
  robots: { index: false, follow: false },
};

/**
 * Dev-only product list — every product in lib/data/products.ts with an
 * Edit link into /admin/products/[slug]/edit. Gated the same way as
 * /admin/add-product (404s outside local development); not linked from
 * anywhere in the site's real navigation.
 */
export default function AdminProductsPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <Container className="flex flex-col gap-8 py-10">
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <strong>Development tool — not intended for public use.</strong> This page and its API routes only work
        during local development — all are disabled in a production build.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 font-semibold text-foreground">Manage Products</h1>
          <p className="mt-2 text-sm text-foreground/60">
            {products.length} product{products.length === 1 ? "" : "s"} in{" "}
            <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">lib/data/products.ts</code>.
          </p>
        </div>
        <Button href="/admin/add-product" variant="outline">
          + Add Product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Image
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Product
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Store
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Price
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Category
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Audience
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Featured
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.slug} className="border-b border-border/60 last:border-b-0 even:bg-surface-muted/40">
                <td className="px-4 py-3">
                  <ProductImage product={product} className="h-12 w-12 rounded-lg" iconClassName="h-5 w-5 text-brand-300" />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/products/${product.slug}`} className="font-medium text-foreground hover:text-brand-600">
                    {product.name}
                  </Link>
                  <p className="text-xs text-foreground/50">{product.slug}</p>
                </td>
                <td className="px-4 py-3 text-foreground/70">{product.store}</td>
                <td className="px-4 py-3 text-foreground/70">{product.currentPrice !== undefined ? formatPrice(product.currentPrice) : "—"}</td>
                <td className="px-4 py-3 text-foreground/70">{getProductCategoryLabel(product.category) ?? product.category}</td>
                <td className="px-4 py-3 text-foreground/70">{product.audience ? getAudienceLabel(product.audience) : "—"}</td>
                <td className="px-4 py-3 text-foreground/70">{product.hidden ? "Hidden" : product.featured ? "Yes" : "—"}</td>
                <td className="px-4 py-3">
                  <Button href={`/admin/products/${product.slug}/edit`} size="sm" variant="outline">
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
