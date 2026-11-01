import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { ContactEmail } from "@/components/legal/ContactEmail";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What Smart Finds collects (very little) and how it's used.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={<p>Smart Finds is a shopping guide with no accounts and no checkout, so we collect very little about you.</p>}
    >
      <LegalSection title="What we collect">
        <ul>
          <li>
            <strong className="font-semibold text-foreground">No accounts.</strong> You don&apos;t sign up or log in, and we
            don&apos;t ask for your name, address or payment details.
          </li>
          <li>
            <strong className="font-semibold text-foreground">Favorites stay on your device.</strong> When you tap the heart
            on a product, it&apos;s saved in your browser&apos;s local storage. It never reaches our servers, and clearing
            your browser data removes it.
          </li>
          <li>
            <strong className="font-semibold text-foreground">Basic server logs.</strong> Like almost every website, our
            hosting provider may automatically log technical details such as your IP address, browser type and the pages
            requested, to keep the site running and secure.
          </li>
          <li>
            <strong className="font-semibold text-foreground">Emails you send us.</strong> If you email us, we use your
            address and message only to reply.
          </li>
        </ul>
      </LegalSection>
      <LegalSection title="When you click to a store">
        <p>
          Product links take you to other websites, such as Amazon, SHEIN, AliExpress or Temu. Those stores and their
          affiliate networks may use cookies or similar tools to track that you came from Smart Finds and whether you made a
          purchase. What they collect is covered by their own privacy policies, not this one. We only receive commission
          reports from them, which don&apos;t tell us who you are.
        </p>
      </LegalSection>
      <LegalSection title="Cookies">
        <p>
          Smart Finds itself doesn&apos;t set advertising or tracking cookies. See our{" "}
          <Link href="/legal/cookies">Cookie Policy</Link> for details.
        </p>
      </LegalSection>
      <LegalSection title="Children">
        <p>Smart Finds is meant for adults. We don&apos;t knowingly collect information from children under 13.</p>
      </LegalSection>
      <LegalSection title="Changes and contact">
        <p>
          If this policy changes, we&apos;ll update the date at the top of this page. Questions? <ContactEmail />
        </p>
      </LegalSection>
    </LegalPage>
  );
}
