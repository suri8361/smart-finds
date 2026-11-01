import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FavoritesList } from "@/components/favorites/FavoritesList";
import { getPublicProducts } from "@/lib/data/products";
import { loadCatalog } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Favorites",
  description: "The finds you've saved on this device.",
};

export default async function FavoritesPage() {
  await loadCatalog();
  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Favorites" }]} />
      <div className="max-w-2xl">
        <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600">Saved for later</p>
        <h1 className="mt-2 font-display text-h1 font-bold tracking-tight text-foreground">Your Favorites</h1>
      </div>
      <FavoritesList products={getPublicProducts()} />
    </Container>
  );
}
