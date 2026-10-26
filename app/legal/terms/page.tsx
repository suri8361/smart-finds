import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";
import { ContactEmail } from "@/components/legal/ContactEmail";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The simple rules for using Smart Finds.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      intro={<p>By using Smart Finds you agree to these terms. They&apos;re short, and written to be read.</p>}
    >
      <LegalSection title="What Smart Finds is">
        <p>
          Smart Finds is a curated list of products from other online stores. We are not a store: we don&apos;t sell,
          ship or take payment for anything. When you buy, you buy from the store you&apos;re sent to, under that
          store&apos;s own terms, prices, shipping and return policies.
        </p>
      </LegalSection>
      <LegalSection title="Prices and information">
        <p>
          We try to keep product details accurate, but prices, stock, sizes and descriptions are set by the stores and can
          change at any time. Always check the details on the store&apos;s site before you buy. We aren&apos;t responsible
          for errors on a store&apos;s site or for problems with an order.
        </p>
      </LegalSection>
      <LegalSection title="Affiliate links">
        <p>
          Many links on the site are affiliate links, which may earn us a commission. See our{" "}
          <Link href="/legal/affiliate-disclosure">Affiliate Disclosure</Link>.
        </p>
      </LegalSection>
      <LegalSection title="Using the site">
        <ul>
          <li>Use Smart Finds for your own personal shopping.</li>
          <li>Don&apos;t copy the site&apos;s content in bulk, scrape it, or try to break or overload it.</li>
          <li>Product names, photos and trademarks belong to their owners.</li>
        </ul>
      </LegalSection>
      <LegalSection title="No warranty">
        <p>
          The site is provided &ldquo;as is&rdquo;. To the extent the law allows, Smart Finds isn&apos;t liable for any
          loss that comes from using the site or from buying anything you found here.
        </p>
      </LegalSection>
      <LegalSection title="Changes and contact">
        <p>
          We may update these terms; the date at the top shows the latest version. Questions? Email <ContactEmail />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
