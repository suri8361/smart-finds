import { Hero } from "@/components/home/Hero";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { ProductRow } from "@/components/home/ProductRow";
import { Container } from "@/components/ui/Container";
import { MessageUsCallout } from "@/components/contact/MessageUs";
import { JoinChat } from "@/components/home/JoinChat";
import { getProductsByCategoryGroup, publicProducts } from "@/lib/data/products";
import { getHeroProducts, getHomeCategories, pickRow } from "@/lib/data/home";

// The hero photos follow the season and change every 3 days (lib/data/hero-rotation.ts). The page is
// rebuilt in the background at most every 10 minutes, so the new set shows up
// shortly after midnight New York time without a new deploy.
export const revalidate = 600;

export default function Home() {
  const now = new Date();
  // Each row skips anything already shown higher up, so no find appears twice on the page.
  // Photos already used in the hero and on the category tiles count as shown too.
  const shown = new Set<string>([
    ...getHeroProducts(now).map((p) => p.slug),
    ...getHomeCategories().flatMap((entry) => (entry.cover ? [entry.cover.slug] : [])),
  ]);
  const take = (products: typeof publicProducts) => {
    const row = pickRow(products, 8, shown);
    row.forEach((p) => shown.add(p.slug));
    return row;
  };

  // New Finds sits right under the hero and gets first pick: simply the newest posts (the list is newest-first).
  const newFinds = take(publicProducts);
  const triedAndTrue = take(getProductsByCategoryGroup("tried-true"));
  const shabbos = take(getProductsByCategoryGroup("shabbos-elegant"));
  const yomTov = take(getProductsByCategoryGroup("yom-tov-holidays"));
  const home = take(getProductsByCategoryGroup("home-kitchen"));

  return (
    <>
      <Hero now={now} />
      <ProductRow
        eyebrow="Just added"
        title="New Finds"
        description="The latest finds on the site, newest first."
        action={{ label: "See all new finds", href: "/new" }}
        products={newFinds}
        priceNote
      />
      <JoinChat />
      <ShopByCategory />
      <FeaturedCollections />
      <ProductRow
        eyebrow="Personally tried"
        title="Tried & True"
        description="Things we've bought and used ourselves."
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
