import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { AddProductImporter } from "@/components/admin/AddProductImporter";

export const metadata: Metadata = {
  title: "Add Product (Dev Tool)",
  robots: { index: false, follow: false },
};

/**
 * Dev-only product importer. Gated at the page level (404s outside local
 * development) in addition to the API route's own guard (app/api/admin/
 * import-product/route.ts) — two independent checks, since either one being
 * accidentally bypassed shouldn't be enough to expose this in production.
 * Not linked from anywhere in the site's navigation.
 */
export default function AddProductPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <Container>
      <AddProductImporter />
    </Container>
  );
}
