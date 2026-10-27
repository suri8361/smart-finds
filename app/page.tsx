import { Hero } from "@/components/home/Hero";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { ProductRow } from "@/components/home/ProductRow";
import { Container } from "@/components/ui/Container";
import { MessageUsCallout } from "@/components/contact/MessageUs";
import { getProductsByCategoryGroup, publicProducts } from "@/lib/data/products";
import { getHeroProducts, getHomeCategories, pickRow } from "@/lib/data/home";

export default function Home() {
  // Each row skips anything already shown higher up, so no find appears twice on the page.
  // Photos already used in the hero and on the category tiles count as shown too.
  const shown = new Set<string>([
    ...getHeroProducts().map((p) => p.slug),
    ...getHomeCategories().flatMap((entry) => (entry.cover ? [entry.cover.slug] : [])),
  ]);
  const take = (products: typeof publicProducts) => {
    const row = pickRow(products, 8, shown);
    row.forEach((p) => shown.add(p.slug));
    return row;
  };

  const featuredFirst = [...publicProducts.filter((p) => p.featured), ...publicProducts.filter((p) => !p.featured)];
  const triedAndTrue = take(getProductsByCategoryGroup("tried-true"));
  const shabbos = take(getProductsByCategoryGroup("shabbos-elegant"));
  const newFinds = take(featuredFirst);
  const yomTov = take(getProductsByCategoryGroup("yom-tov-holidays"));
  const home = take(getProductsByCategoryGroup("home-kitchen"));

  return (
    <>
      <Hero />
      <ShopByCategory />
      <FeaturedCollections />
      <ProductRow
        eyebrow="Sara's own"
        title="Tried & True"
        description="Things Sara has bought and used herself."
        action={{ label: "See all Tried & True", href: "/category/tried-true" }}
        products={triedAndTrue}
      />
      <ProductRow
        eyebrow="Shabbos & simchas"
        title="Shabbos & Elegant"
        description="Elegant, modest picks for Shabbos, Yom Tov and simchas."
        action={{ label: "Shop Shabbos & Elegant", href: "/category/shabbos-elegant" }}
        products={shabbos}
        tinted
      />
      <ProductRow
        eyebrow="Just added"
        title="New Finds"
        description="The latest finds on the site."
        action={{ label: "See all finds", href: "/search" }}
        products={newFinds}
      />
      <ProductRow
        eyebrow="For every Yom Tov"
        title="Yom Tov & Holidays"
        description="Finds for Rosh Hashanah, Sukkos, Chanukah, Purim and every Yom Tov."
        action={{ label: "Shop Yom Tov & Holidays", href: "/category/yom-tov-holidays" }}
        products={yomTov}
        tinted
      />
      <ProductRow
        eyebrow="Around the house"
        title="Home & Kitchen"
        description="Cookware, small appliances and everyday upgrades."
        action={{ label: "Shop Home & Kitchen", href: "/category/home-kitchen" }}
        products={home}
      />
      <section className="pb-16 sm:pb-20">
        <Container>
          <MessageUsCallout />
        </Container>
      </section>
    </>
  );
}
