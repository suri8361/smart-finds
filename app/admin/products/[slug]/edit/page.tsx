import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { getProductBySlug } from "@/lib/data/products";
import { EditProductForm } from "@/components/admin/EditProductForm";

export async function generateMetadata({ params }: PageProps<"/admin/products/[slug]/edit">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit ${slug} (Dev Tool)`, robots: { index: false, follow: false } };
}

/**
 * Dev-only product editor. Gated at the page level (404s outside local
 * development) in addition to app/api/admin/update-product/route.ts's own
 * guard — same two-independent-checks approach as /admin/add-product.
 */
export default async function EditProductPage({ params }: PageProps<"/admin/products/[slug]/edit">) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  return (
    <Container>
      <EditProductForm product={product} />
    </Container>
  );
}
