import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { getHeroPhotos, getHomeStats } from "@/lib/data/home";
import type { HeroPhotoFocus } from "@/lib/data/hero-rotation";
import type { Product } from "@/types/catalog";
import { cn } from "@/lib/utils/cn";

const FOCUS_CLASS: Record<HeroPhotoFocus, string> = {
  top: "object-top",
  center: "",
  bottom: "object-bottom",
};

function HeroPhoto({
  product,
  className,
  tried,
  focus = "center",
}: {
  product: Product;
  className?: string;
  tried?: boolean;
  focus?: HeroPhotoFocus;
}) {
  return (
    <Link prefetch={false}
      href={`/products/${product.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-3xl border border-white/70 bg-surface shadow-card ring-1 ring-black/5",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- product photos come from each store's own domain. */}
      <img
        src={product.image}
        alt={product.name}
        className={cn(
          "h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]",
          FOCUS_CLASS[focus]
        )}
      />
      {tried ? (
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-label-tried-bg px-2.5 py-1 text-[11px] font-semibold text-label-tried-fg shadow">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Tried &amp; True
        </span>
      ) : null}
    </Link>
  );
}

/**
 * Homepage hero: headline + real product photos from the catalog. The three
 * photos change by themselves every 3 days (the sets are listed in
 * lib/data/hero-rotation.ts). The numbers under the buttons are counted
 * from the live product list, so they stay true as finds are added.
 */
export function Hero({ now = new Date() }: { now?: Date }) {
  const [main, second, third] = getHeroPhotos(now);
  const stats = getHomeStats();

  return (
    <section className="relative overflow-hidden border-b border-border bg-linear-to-b from-taupe-200 via-surface-muted to-background dark:from-surface-muted dark:via-background dark:to-background">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-brand-200/30 blur-3xl" aria-hidden="true" />
      <Container className="relative grid gap-12 py-12 sm:py-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16 lg:py-20">
        <div>
          <p className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-brand-600">Hand-picked finds worth sharing</p>
          <h1 className="mt-4 font-display text-[2.6rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Smart finds,
            <br />
            <span className="text-brand-700">all in one place.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-foreground/70 sm:text-lg">
            Fashion, Shabbos &amp; Yom Tov outfits, home, toys and more, picked one by one from Amazon, SHEIN,
            AliExpress, Temu and other stores.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#shop-by-category" size="lg">
              Browse Finds
            </Button>
            <Button href="/category/tried-true" variant="outline" size="lg">
              Tried &amp; True
            </Button>
          </div>

          <dl className="mt-10 flex max-w-md divide-x divide-border/80 border-t border-border/70 pt-6">
            <div className="pr-6">
              <dt className="text-xs uppercase tracking-wide text-foreground/50">Finds</dt>
              <dd className="font-display tracking-tight text-2xl font-bold text-foreground">{stats.finds.toLocaleString("en-US")}</dd>
            </div>
            <div className="pl-6">
              <dt className="text-xs uppercase tracking-wide text-foreground/50">Tried &amp; True</dt>
              <dd className="font-display tracking-tight text-2xl font-bold text-foreground">{stats.triedAndTrue}</dd>
            </div>
          </dl>

          <p className="mt-6 max-w-lg text-xs leading-relaxed text-foreground/50">
            Some links on Smart Finds are{" "}
            <Link prefetch={false}
              href="/legal/affiliate-disclosure"
              className="underline decoration-foreground/30 underline-offset-2 transition-colors hover:text-foreground/75"
            >
              affiliate links
            </Link>
            . If you purchase through them, we may earn a commission at no extra cost to you.
          </p>
        </div>

        {main ? (
          <div className="grid h-[380px] grid-cols-[1.2fr_1fr] grid-rows-2 gap-3 sm:h-[520px] sm:gap-4 lg:h-[560px]">
            {/* The "Tried & True" badge goes on every Tried & True photo, whichever spot it's in. */}
            <HeroPhoto
              product={main.product}
              focus={main.focus}
              className="row-span-2"
              tried={main.product.recommendationLabel === "personally_tried"}
            />
            {second ? (
              <HeroPhoto
                product={second.product}
                focus={second.focus}
                tried={second.product.recommendationLabel === "personally_tried"}
              />
            ) : null}
            {third ? (
              <HeroPhoto
                product={third.product}
                focus={third.focus}
                tried={third.product.recommendationLabel === "personally_tried"}
              />
            ) : null}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
