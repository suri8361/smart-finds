import Link from "next/link";
import { BadgeCheck, ShoppingBag, Sparkles, Star, Tags } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const trustPoints = [
  { icon: Tags, label: "Carefully selected finds worth checking out" },
  { icon: Sparkles, label: "Great finds from across the web, all in one place." },
];

/**
 * Homepage hero. The visual side is a small collage of product-card-shaped
 * placeholders (not a single empty abstract shape) — one panel doubles as a
 * preview of the real recommendation-label system (SRS §1.2) rather than
 * generic decoration, so the hero reads as "shopping site" from the first
 * screen instead of "SaaS landing page."
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-taupe-200 via-surface-muted to-background dark:from-surface-muted dark:via-background dark:to-background">
      <Container className="grid gap-10 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:py-20">
        <div>
          <p className="text-eyebrow font-semibold uppercase tracking-wide text-brand-600">
            Hand-picked finds worth sharing
          </p>
          <h1 className="mt-3 font-display text-display font-semibold tracking-tight text-foreground">
            Discover Smart Finds
          </h1>
          <p className="mt-5 max-w-xl text-base text-foreground/70 sm:text-lg">
            Browse hand-picked finds, great deals, and products worth checking out.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#shop-by-category" size="lg">
              Browse Finds
            </Button>
            <Button href="/about" variant="outline" size="lg">
              About Smart Finds
            </Button>
          </div>
          <p className="mt-4 max-w-xl text-xs leading-relaxed text-foreground/50">
            Some links on Smart Finds are{" "}
            <Link
              href="/legal/affiliate-disclosure"
              className="underline decoration-foreground/30 underline-offset-2 transition-colors hover:text-foreground/75"
            >
              affiliate links
            </Link>
            . If you purchase through them, we may earn a commission at no extra cost to you.
          </p>
          <div className="mt-10 flex flex-col gap-2 border-t border-border/70 pt-6 text-sm text-foreground/60 sm:flex-row sm:items-center sm:gap-6">
            {trustPoints.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto h-[360px] w-full max-w-md sm:h-[420px] lg:mx-0 lg:h-[460px]" aria-hidden="true">
          <div className="absolute -inset-10 -z-10 rounded-full bg-brand-200/15 blur-3xl" />

          <div className="absolute right-4 top-2 h-36 w-28 rotate-6 rounded-[1.5rem] bg-linear-to-br from-sage-200 to-sage-100 shadow-xl sm:right-6 sm:h-44 sm:w-36" />

          <div className="absolute left-1/2 top-1/2 flex h-60 w-48 -translate-x-1/2 -translate-y-1/2 -rotate-3 flex-col justify-between rounded-[1.5rem] bg-linear-to-br from-taupe-300 to-taupe-200 p-5 shadow-2xl sm:h-72 sm:w-60">
            <ShoppingBag className="h-7 w-7 text-brand-800" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-800/70">Today&apos;s pick</p>
              <p className="font-display text-xl text-brand-900">Warm Weather Edit</p>
            </div>
          </div>

          <div className="absolute bottom-6 left-0 z-10 flex items-center gap-2 rounded-2xl bg-surface px-4 py-3 shadow-xl sm:bottom-10 sm:left-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">Highly Rated</span>
          </div>

          <div className="absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-full bg-label-tried-bg px-3 py-1.5 text-xs font-semibold text-label-tried-fg shadow-lg">
            <BadgeCheck className="h-3.5 w-3.5" />
            Personally Tried
          </div>
        </div>
      </Container>
    </section>
  );
}
