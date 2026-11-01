import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { ContactEmail } from "@/components/legal/ContactEmail";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Smart Finds.",
};

export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="Say hello"
      title="Contact"
      showUpdated={false}
      intro={<p>We read every message. The easiest way to reach us is email.</p>}
    >
      <LegalSection title="Email">
        <p className="text-lg">
          <ContactEmail large />
        </p>
      </LegalSection>
      <LegalSection title="Good reasons to write">
        <ul>
          <li>A link is broken, or a product is sold out or has changed.</li>
          <li>You found something great and want us to consider it.</li>
          <li>You&apos;re a brand or store and want to talk about an affiliate program.</li>
          <li>A question about privacy or how we make money.</li>
        </ul>
      </LegalSection>
      <LegalSection title="About orders">
        <p>
          Smart Finds isn&apos;t a store, so we can&apos;t see or change orders. For shipping, returns or refunds, please
          contact the store you bought from. More in our <Link href="/legal/terms">Terms of Use</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
