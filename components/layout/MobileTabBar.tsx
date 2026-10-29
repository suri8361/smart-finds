"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, Search } from "lucide-react";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils/cn";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (path: string) => path === "/" },
  { href: "/search", label: "Search", icon: Search, match: (path: string) => path.startsWith("/search") },
  {
    href: "/categories",
    label: "Categories",
    icon: LayoutGrid,
    match: (path: string) => path.startsWith("/categor"),
  },
  { href: "/favorites", label: "Favorites", icon: Heart, match: (path: string) => path.startsWith("/favorites") },
] as const;

/**
 * App-like bottom tab bar for mobile (SRS §5, §13). The full SRS spec
 * includes a 5th "Account" tab — omitted since the site has no accounts;
 * favorites are saved on the device instead. The current tab is highlighted,
 * and Favorites shows a count once something is saved.
 */
export function MobileTabBar() {
  const pathname = usePathname() ?? "/";
  const { favorites } = useFavorites();

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {tabs.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium",
              active ? "text-brand-700" : "text-foreground/70 hover:text-foreground"
            )}
          >
            <span className="relative">
              <Icon className={cn("h-5 w-5", active && label === "Favorites" ? "fill-brand-600" : "")} aria-hidden="true" />
              {label === "Favorites" && favorites.length > 0 ? (
                <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold leading-none text-white">
                  {favorites.length}
                </span>
              ) : null}
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
