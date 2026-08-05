import { Sparkles, Tags } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const trustPoints = [
  { icon: Tags, label: "Every pick labeled with the exact reason it's here" },
  { icon: Sparkles, label: "Spanning SHEIN, AliExpress, Temu & eBay" },
];

/** Homepage hero — headline, primary/secondary CTAs, and the three trust bullets from SRS §1. */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-brand-50 to-background">
      <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div>
          <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600">
            Curated shopping, honestly labeled
          </p>
          <h1 className="mt-3 text-display font-semibold tracking-tight text-foreground">Discover Smart Finds</h1>
          <p className="mt-5 max-w-xl text-base text-foreground/70 sm:text-lg">
            Browse hand-picked finds from stores you already shop.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#shop-by-category" size="lg">
              Explore Today&apos;s Picks
            </Button>
            <Button href="/about" variant="outline" size="lg">
              About Smart Finds
            </Button>
          </div>
          <ul className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
            {trustPoints.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-foreground/70">
                <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
          <div className="absolute inset-4 rounded-[2.5rem] bg-linear-to-br from-brand-200 via-brand-100 to-transparent" />
          <div className="absolute inset-10 rounded-[2rem] border border-brand-200/60 bg-surface/70 shadow-card backdrop-blur" />
        </div>
      </Container>
    </section>
  );
}
