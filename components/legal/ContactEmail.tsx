import { CONTACT_EMAIL, CONTACT_EMAIL_IS_PLACEHOLDER } from "@/lib/config/site";

/** The site's contact address as a mailto link (shows a visible TODO while it's still the placeholder). */
export function ContactEmail() {
  if (CONTACT_EMAIL_IS_PLACEHOLDER) {
    return (
      <span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-sm text-amber-900">
        {CONTACT_EMAIL} {/* TODO (Sara): set CONTACT_EMAIL in lib/config/site.ts */}
      </span>
    );
  }
  return <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
}
