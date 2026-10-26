import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CollectionCard } from "@/components/home/CollectionCard";
import { collections } from "@/lib/data/collections";

export const metadata: Metadata = {
  title: "Collections",
  description: "Every Smart Finds collection — small, themed edits of our favorite finds.",
};

/** All collections — reuses the homepage's CollectionCard. */
export default function CollectionsPage() {
  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Collections" }]} />

      <div className="max-w-2xl">
        <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600">Curated edits</p>
        <h1 className="mt-2 font-display text-h1 font-semibold tracking-tight text-foreground">All Collections</h1>
        <p className="mt-3 text-base text-foreground/70">Small, themed groups of finds, picked to go together.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {collections.map((collection) => (
          <CollectionCard key={collection.slug} collection={collection} />
        ))}
      </div>
    </Container>
  );
}
