import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About Smart Finds",
  description: "Smart Finds is a curated collection of products from stores like SHEIN, AliExpress, Temu, and eBay.",
};

/**
 * Simple placeholder About page (replaces the earlier "How We Curate" nav
 * target, which never had a page built). Content is exactly what was
 * supplied for this milestone — expand later with the full curation rubric
 * from SRS §1.1/§1.2 once that's ready to publish.
 */
export default function AboutPage() {
  return (
    <Container className="max-w-3xl py-16 sm:py-20">
      <h1 className="font-display text-h1 font-semibold tracking-tight text-foreground">About Smart Finds</h1>
      <div className="mt-6 flex flex-col gap-4 text-base text-foreground/70">
        <p>Smart Finds is a curated collection of products from stores like SHEIN, AliExpress, Temu, and eBay.</p>
        <p>
          The goal is to make it easier to discover products that stand out for their style, value, popularity, or
          overall appeal.
        </p>
        <p>
          Some products are personally tried, while others are selected based on appearance, research, customer
          feedback, and community interest.
        </p>
        <p>When a product has been personally tested, it will always be clearly identified.</p>
      </div>
    </Container>
  );
}
