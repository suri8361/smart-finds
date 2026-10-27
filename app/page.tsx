import { Hero } from "@/components/home/Hero";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { TopPicks } from "@/components/home/TopPicks";
import { TriedAndTrue } from "@/components/home/TriedAndTrue";
import { Container } from "@/components/ui/Container";
import { MessageUsCallout } from "@/components/contact/MessageUs";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <ShopByCategory />
      <TopPicks />
      <TriedAndTrue />
      <section className="pb-16 sm:pb-20">
        <Container>
          <MessageUsCallout />
        </Container>
      </section>
    </>
  );
}
