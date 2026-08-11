import Link from "next/link";

/**
 * Text wordmark — there's no real brand mark yet, so this renders honestly
 * as styled text rather than faking a logo image. Swap for an `<Image>` once
 * a real mark exists.
 */
export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 font-display text-xl font-semibold text-foreground">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-600" aria-hidden="true" />
      Smart Finds
    </Link>
  );
}
