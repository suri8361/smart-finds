import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, Callout } from "@/components/legal/LegalPage";
import { ContactEmail } from "@/components/legal/ContactEmail";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "How Smart Finds uses affiliate links, in plain English.",
};

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage
      title="Affiliate Disclosure"
      intro={
        <p>
          Smart Finds is free to use. We keep it running with affiliate links: when you click a link on this site and buy
          something, the store may pay us a small commission. You never pay more because of it.
        </p>
      }
    >
      <Callout>
        <p>
          <strong className="font-semibold">The short version:</strong> many links on Smart Finds are affiliate links. If
          you buy through them, we may earn a commission at no extra cost to you. As an Amazon Associate I earn from
          qualifying purchases.
        </p>
      </Callout>

      <LegalSection title="What an affiliate link is">
        <p>
          An affiliate link is a normal link to a product on a store&apos;s website, with a code added that tells the store
          the visit came from Smart Finds. If you buy something within the store&apos;s time window, the store may pay us
          a percentage of the sale. The price you pay is exactly the same as if you had gone to the store directly.
        </p>
      </LegalSection>

      <LegalSection title="Programs we take part in">
        <p>
          <strong className="font-semibold text-foreground">Amazon Associates.</strong> Smart Finds is a participant in the
          Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to
          earn fees by linking to Amazon.com. As an Amazon Associate I earn from qualifying purchases.
        </p>
        <p>
          <strong className="font-semibold text-foreground">Other stores.</strong> We also use affiliate links from other
          retailers and affiliate networks, such as SHEIN, AliExpress and Temu. These work the same way: a small
          commission on qualifying purchases, at no extra cost to you.
        </p>
        <p>
          Not every link on the site is an affiliate link, and we don&apos;t earn anything from a link unless a store has
          an affiliate program with us.
        </p>
      </LegalSection>

      <LegalSection title="How this affects what we pick">
        <p>
          It doesn&apos;t decide what we feature. We only mark a product &ldquo;Tried &amp; True&rdquo; when
          we have actually used it. Stores don&apos;t pay us to be listed, and they don&apos;t review or approve
          what we write.
        </p>
      </LegalSection>

      <LegalSection title="Prices and availability">
        <p>
          Prices, deals and stock change often and are set by each store. A price shown on Smart Finds is what we saw when
          we added the product, so always check the final price on the store&apos;s site before you buy. For Amazon
          products we don&apos;t show a price; tap &ldquo;Check price on Amazon&rdquo; to see the current one.
        </p>
        <p>
          Smart Finds is not a store. Orders, payments, shipping, returns and customer service are all handled by the store
          you buy from.
        </p>
      </LegalSection>

      <LegalSection title="Questions">
        <p>
          You can read more on our <Link href="/how-we-make-money">How We Make Money</Link> page, or email us at{" "}
          <ContactEmail />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
