import { Hero } from "@/components/home/Hero";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { TopPicks } from "@/components/home/TopPicks";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCollections />
      <ShopByCategory />
      <TopPicks />
    </>
  );
}
