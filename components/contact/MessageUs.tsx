"use client";

import { MessageCircle } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_EMAIL_IS_PLACEHOLDER } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

const SUBJECT = "Looking for something specific";

/**
 * Opens the visitor's mail app to CONTACT_EMAIL with a prefilled subject.
 * Like the Email button (components/legal/ContactEmail.tsx), the address is
 * never printed and the mailto: link is only built on click, so it isn't in
 * the page HTML.
 */
function openMessage(event: React.MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  if (CONTACT_EMAIL_IS_PLACEHOLDER) return;
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(SUBJECT)}`;
}

/** Small inline "Message us" link (used in the footer). */
export function MessageUsLink({ className, children = "Message us" }: { className?: string; children?: React.ReactNode }) {
  return (
    <a href="#message-us" onClick={openMessage} className={className}>
      {children}
    </a>
  );
}

/**
 * "Looking for something specific?" call-out card with a Message us button.
 * Shown on the home page, search results and category pages.
 */
export function MessageUsCallout({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-taupe-200 via-surface-muted to-surface shadow-card dark:from-surface-muted dark:via-surface dark:to-surface",
        compact ? "px-5 py-6 sm:px-8" : "px-6 py-10 sm:px-12 sm:py-12",
        className
      )}
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-200/25 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface text-brand-600 shadow-card">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h2 className={cn("font-display font-semibold tracking-tight text-foreground", compact ? "text-xl" : "text-h3")}>
              Looking for something specific?
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-foreground/70 sm:text-base">
              Tell me what you need and I&apos;ll find it for you.
            </p>
          </div>
        </div>
        <a
          href="#message-us"
          onClick={openMessage}
          className="inline-flex h-12 w-full shrink-0 items-center justify-center gap-2 rounded-md bg-brand-600 px-7 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Message us
        </a>
      </div>
    </div>
  );
}
