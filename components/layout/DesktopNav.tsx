import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { categories } from "@/lib/data/categories";

/**
 * Primary desktop navigation. The category mega-menu uses a native
 * `<details>/<summary>` disclosure instead of client-side state — it's
 * keyboard-accessible and needs zero JavaScript, keeping this a server
 * component. Known limitation: unlike a JS-driven menu, it won't
 * light-dismiss on outside click, only on toggling `<summary>` again or
 * navigating away — acceptable for this milestone, revisit if/when a
 * headless-UI library (SRS §20) is introduced for more complex interactions.
 */
export function DesktopNav() {
  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
          Categories
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="absolute left-0 top-full z-20 mt-2 w-[560px] rounded-2xl border border-border bg-surface p-4 shadow-card">
          <ul className="grid grid-cols-2 gap-1">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="flex items-start gap-3 rounded-xl p-3 hover:bg-surface-muted"
                  >
                    <Icon className="mt-0.5 h-5 w-5 text-brand-600" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-medium text-foreground">{category.name}</span>
                      <span className="block text-xs text-foreground/60">{category.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </details>

      <Link href="/collections" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted">
        Collections
      </Link>
      <Link
        href="/about"
        className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
      >
        About Smart Finds
      </Link>
    </nav>
  );
}
