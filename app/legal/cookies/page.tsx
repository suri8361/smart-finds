import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { ContactEmail } from "@/components/legal/ContactEmail";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Smart Finds sets no tracking cookies; stores you visit may set their own.",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Cookie Policy">
      <LegalSection title="Cookies on Smart Finds">
        <p>
          Smart Finds doesn&apos;t set advertising or tracking cookies, and we don&apos;t run ads. The only thing we save
          in your browser is your list of favorites, kept in local storage (a cookie-like storage area) so the hearts you
          tap are still there next time. You can remove it at any time by clearing your browser&apos;s site data.
        </p>
      </LegalSection>
      <LegalSection title="Cookies from stores and affiliate networks">
        <p>
          When you tap a product link, you leave Smart Finds and go to the store&apos;s website. The store, or the
          affiliate network that runs its program, may set cookies so it knows you came from us and can credit us if you
          buy something. These cookies are set by them, on their sites, under their own cookie and privacy policies.
        </p>
      </LegalSection>
      <LegalSection title="Your choices">
        <p>
          Most browsers let you block or delete cookies in their settings. Blocking cookies on a store&apos;s site
          won&apos;t stop you from shopping there; it just means we may not get credit for the sale. More in our{" "}
          <Link href="/legal/privacy">Privacy Policy</Link>, or email <ContactEmail />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
