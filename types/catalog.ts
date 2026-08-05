import type { LucideIcon } from "lucide-react";

/**
 * Controlled recommendation-label vocabulary (SRS §1.2). This is the only
 * set of reasons a product may be shown as selected for — every published
 * product carries at least one, each backed by the evidence shape below.
 */
export type SelectionReasonType =
  | "personally_tried"
  | "chosen_for_look"
  | "popular_pick"
  | "highly_rated"
  | "community_requested"
  | "great_price"
  | "trending_find";

/** Rating evidence required to apply the "highly_rated" label (SRS §1.2). */
export interface RatingEvidence {
  value: number;
  count: number;
  source: string;
  asOf: string;
}

/**
 * Evidence attached to a selection reason. `note` is always required and is
 * the copy surfaced on the product card/page as "why we picked this" — the
 * other fields are label-specific substantiation (SRS §11.1 `ProductSelectionReason`).
 */
export interface SelectionReasonEvidence {
  note: string;
  rating?: RatingEvidence;
  priceComparison?: string;
  trend?: string;
  requestSource?: string;
  styleNote?: string;
  popularitySignal?: string;
}

export interface ProductSelectionReason {
  type: SelectionReasonType;
  evidence: SelectionReasonEvidence;
}

export interface Retailer {
  slug: string;
  name: string;
}

export interface ProductRetailerLink {
  retailer: Retailer;
  priceLow: number;
  priceHigh: number;
  currency: string;
  /** ISO date string — price is shown as a band "as of" this date, never as a live price (SRS §6). */
  lastCheckedAt: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface Collection {
  slug: string;
  title: string;
  description: string;
  accent: "brand" | "amber" | "emerald" | "rose";
}

export interface Product {
  slug: string;
  title: string;
  /** "Why we picked this" copy — must match the applied selectionReasons (SRS §1.2 rule 3). */
  summary: string;
  categorySlug: string;
  selectionReasons: ProductSelectionReason[];
  retailerLinks: ProductRetailerLink[];
  lastVerifiedAt: string;
}
