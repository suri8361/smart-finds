import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { ContactEmail } from "@/components/legal/ContactEmail";

export const metadata: Metadata = {
  title: "How We Make Money",
  description: "Smart Finds is free to use and earns small commissions through affiliate links.",
};

export default function HowWeMakeMoneyPage() {
  return (
    <LegalPage eyebrow="Trust" title="How We Make Money" showUpdated={false}>
      <LegalSection title="Affiliate commissions">
        <p>
          Smart Finds is free. When you tap &ldquo;View Find&rdquo; and buy something from the store, the store may pay us a
          small commission. Your price doesn&apos;t change. That commission is how we pay for the site and the time it
          takes to find good products.
        </p>
        <p>As an Amazon Associate I earn from qualifying purchases.</p>
      </LegalSection>
      <LegalSection title="What we don't do">
        <ul>
          <li>We don&apos;t sell products ourselves or handle your order or payment.</li>
          <li>We don&apos;t charge stores to be listed, and we don&apos;t run paid placements.</li>
          <li>We don&apos;t sell your personal information. There are no accounts, and your favorites stay on your own device.</li>
        </ul>
      </LegalSection>
      <LegalSection title="How products get picked">
        <p>
          Every product is picked for its style, value or popularity, never for the commission. Items marked
          &ldquo;Tried &amp; True&rdquo; are ones I&apos;ve personally used.
        </p>
      </LegalSection>
      <LegalSection title="More detail">
        <p>
          See our full <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>, or email <ContactEmail />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
