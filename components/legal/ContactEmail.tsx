"use client";

import { CONTACT_EMAIL, CONTACT_EMAIL_IS_PLACEHOLDER } from "@/lib/config/site";

/**
 * An "Email" button that opens the visitor's mail app. The address itself is
 * never printed on the page, and the mailto: link is only built on click, so
 * it isn't sitting in the page HTML for spam scrapers.
 */
export function ContactEmail({ large = false }: { large?: boolean }) {
  if (CONTACT_EMAIL_IS_PLACEHOLDER) {
    return (
      <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-sm text-amber-900">
        {/* TODO (Sara): set CONTACT_EMAIL in lib/config/site.ts */}
        Email (address not set yet)
      </span>
    );
  }
  return (
    <a
      href="#email"
      onClick={(e) => {
        e.preventDefault();
        window.location.href = `mailto:${CONTACT_EMAIL}`;
      }}
      className={
        "inline-flex items-center gap-1.5 rounded-full border border-current font-medium no-underline hover:opacity-80 " +
        (large ? "px-5 py-2 text-base" : "px-3 py-0.5 text-sm align-middle")
      }
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className={large ? "h-5 w-5" : "h-4 w-4"} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
      Email
    </a>
  );
}
