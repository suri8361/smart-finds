import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FilterBar } from "@/components/catalog/FilterBar";
import { SortDropdown } from "@/components/catalog/SortDropdown";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { CollectionCard } from "@/components/home/CollectionCard";
import { categories, getCategoryBySlug } from "@/lib/data/categories";
import { getProductsByCategoryGroup } from "@/lib/data/products";
import { getCollectionsRelatedToCategory } from "@/lib/data/collections";
import {
  filterByHoliday,
  filterByShopper,
  filterByType,
  getShopperFilter,
  holidayOptions,
  shopperOptions,
  typeOptions,
} from "@/lib/data/shopFilters";
import { cn } from "@/lib/utils/cn";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return { title: category.name, description: category.description };
}

/** Sections whose clothing gets the Women / Men / Kids / Maternity chips. */
const SHOPPER_SECTIONS = new Set(["fashion-style", "shabbos-elegant"]);

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function Chip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-border bg-surface text-foreground/80 hover:border-foreground/30 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}

function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-eyebrow font-semibold uppercase tracking-wide text-foreground/50">{label}</span>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap">{children}</div>
    </div>
  );
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const query = await searchParams;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const allProducts = getProductsByCategoryGroup(category.slug);
  const relatedCollections = getCollectionsRelatedToCategory(category.slug);
  const Icon = category.icon;

  const showShopper = SHOPPER_SECTIONS.has(category.slug);
  const showType = category.slug === "fashion-style";
  const showHoliday = category.slug === "yom-tov-holidays";

  const shopperOpts = showShopper ? shopperOptions(allProducts) : [];
  const shop = shopperOpts.some((option) => option.value === one(query.shop)) ? one(query.shop) : undefined;
  const byShopper = filterByShopper(allProducts, shop);

  const typeOpts = showType ? typeOptions(byShopper) : [];
  const type = typeOpts.some((option) => option.value === one(query.type)) ? one(query.type) : undefined;

  const holidayOpts = showHoliday ? holidayOptions(allProducts) : [];
  const holiday = holidayOpts.some((option) => option.value === one(query.holiday)) ? one(query.holiday) : undefined;

  const categoryProducts = filterByHoliday(filterByType(byShopper, type), holiday);

  const href = (next: { shop?: string; type?: string; holiday?: string }) => {
    const search = new URLSearchParams();
    if (next.shop) search.set("shop", next.shop);
    if (next.type) search.set("type", next.type);
    if (next.holiday) search.set("holiday", next.holiday);
    const qs = search.toString();
    return `/category/${category.slug}${qs ? `?${qs}` : ""}`;
  };

  const kidsPicked = shop === "kids" || !!getShopperFilter(shop)?.kids;
  const mainShoppers = shopperOpts.filter((option) => !option.kids);
  const kidShoppers = shopperOpts.filter((option) => option.kids);

  return (
    <Container className="flex flex-col gap-10 py-10 sm:py-14">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      <div className="max-w-2xl">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-taupe-200 text-brand-600">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 font-display text-h1 font-semibold tracking-tight text-foreground">{category.name}</h1>
        <p className="mt-3 text-base text-foreground/70">{category.description}</p>
      </div>

      {mainShoppers.length > 0 || typeOpts.length > 1 || holidayOpts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {mainShoppers.length > 0 ? (
            <ChipRow label="Shop for">
              <Chip href={href({ type })} active={!shop}>
                All
              </Chip>
              {mainShoppers.map((option) => (
                <Chip
                  key={option.value}
                  href={href({ shop: option.value, type })}
                  active={shop === option.value || (option.value === "kids" && kidsPicked)}
                >
                  {option.label}
                </Chip>
              ))}
            </ChipRow>
          ) : null}
          {kidsPicked && kidShoppers.length > 0 ? (
            <ChipRow label="Kids">
              <Chip href={href({ shop: "kids", type })} active={shop === "kids"}>
                All Kids
              </Chip>
              {kidShoppers.map((option) => (
                <Chip key={option.value} href={href({ shop: option.value, type })} active={shop === option.value}>
                  {option.label}
                </Chip>
              ))}
            </ChipRow>
          ) : null}
          {typeOpts.length > 1 ? (
            <ChipRow label="Type">
              <Chip href={href({ shop })} active={!type}>
                All
              </Chip>
              {typeOpts.map((option) => (
                <Chip key={option.value} href={href({ shop, type: option.value })} active={type === option.value}>
                  {option.label}
                </Chip>
              ))}
            </ChipRow>
          ) : null}
          {holidayOpts.length > 0 ? (
            <ChipRow label="Holiday">
              <Chip href={href({})} active={!holiday}>
                All
              </Chip>
              {holidayOpts.map((option) => (
                <Chip key={option.value} href={href({ holiday: option.value })} active={holiday === option.value}>
                  {option.label}
                </Chip>
              ))}
            </ChipRow>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar />
        <SortDropdown />
      </div>

      <ProductGrid
        products={categoryProducts}
        emptyTitle="No picks in this category yet"
        emptyDescription="We're still curating this one — check back soon or browse another category."
      />

      <div className="flex flex-col gap-6 border-t border-border pt-10">
        <h2 className="font-display text-h3 font-semibold text-foreground">Related Collections</h2>
        {relatedCollections.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedCollections.map((collection) => (
              <CollectionCard key={collection.slug} collection={collection} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-foreground/50">No related collections yet — check back soon.</p>
        )}
      </div>
    </Container>
  );
}
