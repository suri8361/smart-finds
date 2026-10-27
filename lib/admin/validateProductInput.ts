import type { ProductCodeInput } from "@/lib/admin/generateProductCode";
import { productCategories } from "@/lib/data/productCategories";
import { audiences } from "@/lib/data/audiences";
import { occasions } from "@/lib/data/occasions";

const VALID_CATEGORIES = new Set(productCategories.map((category) => category.value));
const VALID_AUDIENCES = new Set(audiences.map((audience) => audience.value));
const VALID_OCCASIONS = new Set(occasions.map((occasion) => occasion.value));
// Mirrors the keys of RECOMMENDATION_LABELS (components/product/RecommendationBadge.tsx) —
// duplicated here rather than imported, since that file is a "use client" component module.
const VALID_RECOMMENDATION_LABELS = new Set([
  "personally_tried",
  "chosen_for_look",
  "popular_pick",
  "highly_rated",
  "community_requested",
  "great_price",
  "trending_find",
]);

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Shared request-body validation for both app/api/admin/save-product/route.ts
 * (new products) and app/api/admin/update-product/route.ts (edits) — same
 * required fields, same controlled-vocabulary checks, same shape checks for
 * the optional gallery/measurement fields, so the two routes can't drift.
 */
export function validateProductCodeInput(input: Partial<ProductCodeInput>): ValidationResult {
  const missing: string[] = [];
  if (!input.slug) missing.push("slug");
  if (!input.name) missing.push("name");
  if (!input.currentPrice || Number.isNaN(Number(input.currentPrice))) missing.push("current price");
  if (!input.affiliateUrl) missing.push("affiliate URL");
  if (!input.store) missing.push("store");
  if (!input.category) missing.push("category");
  if (!input.description) missing.push("description");

  if (missing.length > 0) {
    return { valid: false, message: `Missing required fields: ${missing.join(", ")}.` };
  }

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(input.slug!)) {
    return { valid: false, message: "Slug must be lowercase letters, numbers, and hyphens only." };
  }

  if (!VALID_CATEGORIES.has(input.category as (typeof productCategories)[number]["value"])) {
    return { valid: false, message: `"${input.category}" isn't a recognized category.` };
  }

  if (input.audience && !VALID_AUDIENCES.has(input.audience as (typeof audiences)[number]["value"])) {
    return { valid: false, message: `"${input.audience}" isn't a recognized audience.` };
  }

  if (input.occasion && !VALID_OCCASIONS.has(input.occasion as (typeof occasions)[number]["value"])) {
    return { valid: false, message: `"${input.occasion}" isn't a recognized occasion.` };
  }

  if (input.recommendationLabel && !VALID_RECOMMENDATION_LABELS.has(input.recommendationLabel)) {
    return { valid: false, message: `"${input.recommendationLabel}" isn't a recognized recommendation label.` };
  }

  if (
    input.images !== undefined &&
    (!Array.isArray(input.images) || !input.images.every((url) => typeof url === "string" && url.trim()))
  ) {
    return { valid: false, message: "images must be a list of image URLs." };
  }

  if (input.sizeMeasurements !== undefined) {
    const isValidShape =
      Array.isArray(input.sizeMeasurements) &&
      input.sizeMeasurements.every(
        (row) =>
          row &&
          typeof row === "object" &&
          typeof row.size === "string" &&
          row.measurements &&
          typeof row.measurements === "object" &&
          !Array.isArray(row.measurements) &&
          Object.values(row.measurements).every((value) => typeof value === "string")
      );
    if (!isValidShape) {
      return { valid: false, message: "sizeMeasurements has an unexpected shape." };
    }
  }

  if (input.sizeNote !== undefined && typeof input.sizeNote !== "string") {
    return { valid: false, message: "sizeNote must be a string." };
  }

  if (input.sourceUrl !== undefined && typeof input.sourceUrl !== "string") {
    return { valid: false, message: "sourceUrl must be a string." };
  }

  return { valid: true };
}
