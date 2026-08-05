import Link from "next/link";
import { Heart, Home, LayoutGrid, Search } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/#shop-by-category", label: "Categories", icon: LayoutGrid },
  { href: "/favorites", label: "Favorites", icon: Heart },
] as const;

/**
 * App-like bottom tab bar for mobile (SRS §5, §13). The full SRS spec
 * includes a 5th "Account" tab — omitted here since this milestone
 * explicitly excludes authentication; add it back once real accounts ship.
 * "Categories" links to the homepage's in-page section rather than a
 * category index page, since no such page exists yet and this way the tab
 * is fully functional today instead of 404ing.
 */
export function MobileTabBar() {
  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 backdrop-blur lg:hidden"
    >
      {tabs.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium text-foreground/70 hover:text-foreground"
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
