import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CategoryTile } from "@/components/home/CategoryTile";
import { categories } from "@/lib/data/categories";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse every Smart Finds category — hand-picked finds across home, tech, fashion, beauty, outdoor, and office.",
};

/** Categories landing page — reuses the same CategoryTile used on the homepage's "Shop by Category" section. */
export default function CategoriesPage() {
  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Categories" }]} />

      <div className="max-w-2xl">
        <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600">Browse</p>
        <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-foreground">All Categories</h1>
        <p className="mt-3 text-base text-foreground/70">
          Every category opens with hand-picked top picks before the full, filterable grid.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <CategoryTile key={category.slug} category={category} />
        ))}
      </div>
    </Container>
  );
}
