import type { Product } from "@/types/catalog";
import { retailerBySlug } from "@/lib/data/retailers";

/**
 * Placeholder product catalog. In a later milestone this is replaced by the
 * `Product` / `ProductSelectionReason` / `ProductRetailerLink` tables (SRS
 * §11.1). Every item below carries at least one recommendation label with
 * the evidence required to apply it (SRS §1.2) — this file intentionally
 * exercises all seven labels so the visual treatment of each is reviewable.
 */
export const products: Product[] = [
  {
    slug: "ceramic-pour-over-dripper",
    title: "Ceramic Pour-Over Coffee Dripper",
    summary:
      "Reviewers consistently praise the even extraction, and the price undercuts comparable ceramic drippers.",
    categorySlug: "home-kitchen",
    selectionReasons: [
      {
        type: "highly_rated",
        evidence: {
          note: "4.7 average across 2,300+ ratings on eBay as of Aug 1, 2026.",
          rating: { value: 4.7, count: 2300, source: "eBay", asOf: "2026-08-01" },
        },
      },
      {
        type: "great_price",
        evidence: {
          note: "Priced below the category median for ceramic pour-over drippers.",
          priceComparison: "~20% under category median",
        },
      },
    ],
    retailerLinks: [
      { retailer: retailerBySlug.ebay, priceLow: 22, priceHigh: 26, currency: "USD", lastCheckedAt: "2026-08-01" },
      { retailer: retailerBySlug.temu, priceLow: 19, priceHigh: 23, currency: "USD", lastCheckedAt: "2026-07-29" },
    ],
    lastVerifiedAt: "2026-08-01",
  },
  {
    slug: "nested-aluminum-camp-cookware",
    title: "Nested Aluminum Camp Cookware Set",
    summary:
      "We packed this on a three-night trip — it nests small, boiled water fast, and nothing warped over a campfire.",
    categorySlug: "outdoor-camping",
    selectionReasons: [
      {
        type: "personally_tried",
        evidence: {
          note: "Used on a 3-night backcountry trip, July 2026; held up over direct flame and packed down small.",
        },
      },
    ],
    retailerLinks: [
      { retailer: retailerBySlug.aliexpress, priceLow: 34, priceHigh: 40, currency: "USD", lastCheckedAt: "2026-07-30" },
    ],
    lastVerifiedAt: "2026-07-30",
  },
  {
    slug: "linen-blend-wide-leg-trousers",
    title: "Oversized Linen-Blend Wide-Leg Trousers",
    summary:
      "Chosen for the drape and the wide-leg silhouette that's been everywhere this season — we haven't tried these on ourselves.",
    categorySlug: "fashion-style",
    selectionReasons: [
      {
        type: "chosen_for_look",
        evidence: {
          note: "Selected for the relaxed drape and wide-leg silhouette, not for tested fit or fabric durability.",
          styleNote: "Oversized, high-rise, wide-leg",
        },
      },
      {
        type: "trending_find",
        evidence: {
          note: "Wide-leg linen trousers have been a recurring summer 2026 trend across style roundups.",
          trend: "Summer 2026 trouser silhouette trend",
        },
      },
    ],
    retailerLinks: [
      { retailer: retailerBySlug.shein, priceLow: 19, priceHigh: 25, currency: "USD", lastCheckedAt: "2026-07-25" },
    ],
    lastVerifiedAt: "2026-07-25",
  },
  {
    slug: "titanium-smartwatch-band",
    title: "44mm Titanium Smartwatch Band",
    summary:
      "Selected because it's consistently one of the top-selling watch bands in its category — we haven't tested wear-and-tear ourselves.",
    categorySlug: "tech-electronics",
    selectionReasons: [
      {
        type: "popular_pick",
        evidence: {
          note: "Ranked in the retailer's top sellers for smartwatch bands as of July 2026.",
          popularitySignal: "Bestseller badge, AliExpress, July 2026",
        },
      },
    ],
    retailerLinks: [
      { retailer: retailerBySlug.aliexpress, priceLow: 12, priceHigh: 18, currency: "USD", lastCheckedAt: "2026-07-27" },
    ],
    lastVerifiedAt: "2026-07-27",
  },
  {
    slug: "gua-sha-facial-tool-set",
    title: "Gua Sha Facial Massage Tool Set",
    summary: "Multiple members asked us to cover gua sha tools, and this set's ratings stood out from the crowd.",
    categorySlug: "beauty-personal-care",
    selectionReasons: [
      {
        type: "community_requested",
        evidence: {
          note: "Requested by members via the site's contact form multiple times in June 2026.",
          requestSource: "Member contact-form submissions, June 2026",
        },
      },
      {
        type: "highly_rated",
        evidence: {
          note: "4.5 average across 900+ ratings on eBay as of July 2026.",
          rating: { value: 4.5, count: 900, source: "eBay", asOf: "2026-07-20" },
        },
      },
    ],
    retailerLinks: [
      { retailer: retailerBySlug.temu, priceLow: 8, priceHigh: 12, currency: "USD", lastCheckedAt: "2026-07-20" },
      { retailer: retailerBySlug.ebay, priceLow: 9, priceHigh: 13, currency: "USD", lastCheckedAt: "2026-07-18" },
    ],
    lastVerifiedAt: "2026-07-20",
  },
  {
    slug: "adjustable-aluminum-laptop-stand",
    title: "Adjustable Aluminum Laptop Stand",
    summary: "One of the better-selling stands in its category, and priced under comparable aluminum stands.",
    categorySlug: "home-office",
    selectionReasons: [
      {
        type: "great_price",
        evidence: {
          note: "Priced below comparable aluminum laptop stands reviewed in the same category sweep.",
          priceComparison: "~15% under category median",
        },
      },
      {
        type: "popular_pick",
        evidence: {
          note: "Consistently ranked among the top-selling laptop stands on eBay, July 2026.",
          popularitySignal: "Sales rank top 20, eBay, July 2026",
        },
      },
    ],
    retailerLinks: [
      { retailer: retailerBySlug.ebay, priceLow: 26, priceHigh: 32, currency: "USD", lastCheckedAt: "2026-07-31" },
      { retailer: retailerBySlug.aliexpress, priceLow: 28, priceHigh: 33, currency: "USD", lastCheckedAt: "2026-07-29" },
    ],
    lastVerifiedAt: "2026-07-31",
  },
  {
    slug: "insulated-steel-camp-mug",
    title: "Insulated Steel Camp Mug, 20oz",
    summary:
      "We've used this on every trip since spring — coffee stays hot for hours, and it's cheaper than most insulated mugs we compared it to.",
    categorySlug: "outdoor-camping",
    selectionReasons: [
      {
        type: "personally_tried",
        evidence: { note: "In daily use since spring 2026; kept coffee hot for 4+ hours on a cold-morning trip." },
      },
      {
        type: "great_price",
        evidence: {
          note: "Priced below comparable 20oz insulated steel mugs.",
          priceComparison: "~25% under category median",
        },
      },
    ],
    retailerLinks: [
      { retailer: retailerBySlug.temu, priceLow: 15, priceHigh: 19, currency: "USD", lastCheckedAt: "2026-08-02" },
    ],
    lastVerifiedAt: "2026-08-02",
  },
  {
    slug: "minimalist-wireless-charging-stand",
    title: "Minimalist Wireless Charging Stand",
    summary: "Showing up across desk-setup roundups this season, and its ratings back up the hype.",
    categorySlug: "tech-electronics",
    selectionReasons: [
      {
        type: "trending_find",
        evidence: {
          note: "Recurring feature in desk-setup content through mid-2026.",
          trend: "Desk-setup minimalism trend, 2026",
        },
      },
      {
        type: "highly_rated",
        evidence: {
          note: "4.6 average across 1,500+ ratings on eBay as of Aug 2026.",
          rating: { value: 4.6, count: 1500, source: "eBay", asOf: "2026-08-02" },
        },
      },
    ],
    retailerLinks: [
      { retailer: retailerBySlug.ebay, priceLow: 17, priceHigh: 22, currency: "USD", lastCheckedAt: "2026-08-02" },
      { retailer: retailerBySlug.aliexpress, priceLow: 19, priceHigh: 24, currency: "USD", lastCheckedAt: "2026-08-01" },
    ],
    lastVerifiedAt: "2026-08-02",
  },
];
