import Link from "next/link";
import { Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/layout/Logo";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { SearchBar } from "@/components/layout/SearchBar";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { getFashionMenu, getHolidayMenu } from "@/lib/data/menus";

/** Site header: hamburger (mobile) + logo + primary nav (desktop) + search + favorites (SRS §5). */
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-4">
        <MobileMenu fashionLinks={getFashionMenu()} holidayLinks={getHolidayMenu()} />
        <Logo />
        <DesktopNav />
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:block md:w-64 lg:w-80">
            <SearchBar />
          </div>
          <Link
            href="/favorites"
            aria-label="Favorites"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
          >
            <Heart className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </header>
  );
}
