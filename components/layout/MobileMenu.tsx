"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { categories } from "@/lib/data/categories";
import { SearchBar } from "@/components/layout/SearchBar";

const supportLinks = [
  { href: "/collections", label: "Collections" },
  { href: "/retailers", label: "Retailers" },
  { href: "/about", label: "About Smart Finds" },
  { href: "/favorites", label: "Favorites" },
];

/**
 * Hamburger + slide-over drawer. This is the one interactive island in the
 * layout that needs real client state (open/close, backdrop dismiss) rather
 * than a pure-CSS disclosure — everything else in the header stays a server
 * component (SRS §15 RSC-first guidance).
 *
 * The drawer itself is rendered through a portal into `document.body`
 * instead of in place. The header is `sticky` with `backdrop-blur`, and a
 * `backdrop-filter` on an ancestor creates a new containing block for
 * `position: fixed` descendants in Chromium/WebKit — without the portal,
 * this drawer's `fixed inset-0` would resolve against the 64px-tall header
 * box instead of the viewport, clipping it to a sliver. The portal renders
 * outside that subtree entirely, which is also just the standard place to
 * render a modal/drawer from. `mounted` defers the portal to after the
 * client mounts, since `document` doesn't exist during server rendering —
 * `useSyncExternalStore` (never-changing subscription, server snapshot
 * `false`) is the React-recommended way to read that without triggering
 * the extra render an effect-driven `setState` would cause.
 */
const subscribe = () => () => {};

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const drawer = (
    <div id="mobile-nav" role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
      <div className="relative ml-auto flex h-full w-full max-w-sm flex-col gap-6 overflow-y-auto bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-foreground">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
          >
            <X className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>

        <SearchBar />

        <nav aria-label="Mobile" className="flex flex-col gap-1">
          <p className="px-1 text-eyebrow font-semibold uppercase tracking-wide text-foreground/50">Categories</p>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
            >
              {category.name}
            </Link>
          ))}
          <div className="my-2 h-px bg-border" />
          {supportLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-surface-muted"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
        <span className="sr-only">Open menu</span>
      </button>

      {open && mounted ? createPortal(drawer, document.body) : null}
    </div>
  );
}
