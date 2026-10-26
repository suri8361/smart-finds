import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { categories } from "@/lib/data/categories";
import { retailers } from "@/lib/data/retailers";
import { AMAZON_ENABLED } from "@/lib/config/affiliate";

const trustLinks = [
  { href: "/about", label: "About Smart Finds" },
  { href: "/how-we-make-money", label: "How We Make Money" },
  { href: "/contact", label: "Contact" },
];

const legalLinks = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Use" },
  { href: "/legal/affiliate-disclosure", label: "Affiliate Disclosure" },
  { href: "/legal/cookies", label: "Cookie Policy" },
];

/** Site footer — link columns plus the FTC-required affiliate disclosure (SRS §16, §24). */
export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-muted">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-2">
          <Link href="/" className="font-display text-xl font-semibold text-foreground">
            Smart Finds
          </Link>
          <p className="mt-3 max-w-sm text-sm text-foreground/70">
            An independently curated shopping guide — every product is labeled with the specific reason it was
            picked, so you always know why it&apos;s here.
          </p>
          <form action="#" className="mt-5 flex max-w-sm gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@example.com"
              className="h-10 flex-1 rounded-full border border-border bg-surface px-4 text-sm text-foreground placeholder:text-foreground/40 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <Button type="submit" size="sm">
              Subscribe
            </Button>
          </form>
          <p className="mt-2 text-xs text-foreground/50">
            Newsletter signup is a visual placeholder — no email is sent yet.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Shop by Category</h3>
          <ul className="mt-3 space-y-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link href={`/category/${category.slug}`} className="text-sm text-foreground/70 hover:text-foreground">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Retailers</h3>
          <ul className="mt-3 space-y-2">
            {retailers.map((retailer) => (
              <li key={retailer.slug}>
                <Link href={`/retailers/${retailer.slug}`} className="text-sm text-foreground/70 hover:text-foreground">
                  {retailer.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">Trust &amp; Company</h3>
          <ul className="mt-3 space-y-2">
            {trustLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-foreground/70 hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-4 py-6 text-xs text-foreground/60 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-3xl">
            <strong className="font-semibold text-foreground/80">Affiliate Disclosure:</strong> Smart Finds
            participates in affiliate programs with {AMAZON_ENABLED ? "Amazon, " : ""}SHEIN, AliExpress, Temu, eBay, and other
            retailers. If you buy something through a link on this site, we may earn a commission — at no
            additional cost to you.{AMAZON_ENABLED ? " As an Amazon Associate I earn from qualifying purchases." : ""} Affiliate relationships never influence which products we choose to feature.
            Read more on our{" "}
            <Link href="/how-we-make-money" className="underline hover:text-foreground">
              How We Make Money
            </Link>{" "}
            page.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </Container>
        <Container className="pb-6 text-xs text-foreground/50">
          © {new Date().getFullYear()} Smart Finds. Not a retailer — all purchases are completed on the
          retailer&apos;s site.
        </Container>
      </div>
    </footer>
  );
}
