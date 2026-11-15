/** Mirrors `SizeMeasurement` (types/catalog.ts) — kept as a separate type here so this module has no dependency on the strict `Product` shape, same rationale as the rest of this file's plain-string fields. */
export interface SizeMeasurementInput {
  size: string;
  measurements: Record<string, string>;
}

/** What the scraper (lib/admin/scrapeProduct.ts) found for sizing specifically, shared with the UI (components/admin/SizeMeasurementsEditor.tsx) so both sides agree on the same four outcomes. */
export type SizeImportStatus = "measurements" | "sizes_only" | "blocked" | "not_available";

/**
 * Pure formatter — turns the admin importer's form state into a ready-to-paste
 * TypeScript object literal matching `Product` (types/catalog.ts), styled to
 * match the existing entries in lib/data/products.ts (double-quoted strings,
 * 2-space indent, optional fields omitted rather than written as `undefined`).
 */
export interface ProductCodeInput {
  slug: string;
  name: string;
  image?: string;
  /** Full gallery, in order — only written out when it has more than one photo (a single-entry gallery is redundant with `image`). */
  images?: string[];
  currentPrice: string;
  originalPrice?: string;
  affiliateUrl: string;
  /** Admin-only bookkeeping — the retailer page data was scraped from, never shown publicly. */
  sourceUrl?: string;
  store: string;
  category: string;
  collection?: string;
  audience?: string;
  occasion?: string;
  recommendationLabel?: string;
  description: string;
  /** Comma-separated */
  sizes?: string;
  /** Comma-separated */
  colors?: string;
  sizeMeasurements?: SizeMeasurementInput[];
  sizeNote?: string;
  featured?: boolean;
}

function toNumberLiteral(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : String(parsed);
}

function toStringArray(commaSeparated: string | undefined): string[] {
  if (!commaSeparated) return [];
  return commaSeparated
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toSizeMeasurementsCode(rows: SizeMeasurementInput[] | undefined): string | undefined {
  if (!rows) return undefined;
  const validRows = rows.filter((row) => row.size.trim() && Object.keys(row.measurements).length > 0);
  if (validRows.length === 0) return undefined;

  const rowsCode = validRows
    .map((row) => {
      const measurementsCode = Object.entries(row.measurements)
        .map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`)
        .join(", ");
      return `      { size: ${JSON.stringify(row.size)}, measurements: { ${measurementsCode} } },`;
    })
    .join("\n");
  return `[\n${rowsCode}\n    ]`;
}

/** Just the `{ ... },` object literal — same shape as an entry in the `products` array in lib/data/products.ts, so it can be inserted directly (see app/api/admin/save-product/route.ts) or embedded in the copy/paste snippet below. */
export function generateProductObjectLiteral(input: ProductCodeInput): string {
  const lines: string[] = [];
  const push = (key: string, valueCode: string) => lines.push(`    ${key}: ${valueCode},`);

  push("slug", JSON.stringify(input.slug));
  push("name", JSON.stringify(input.name));

  if (input.image) push("image", JSON.stringify(input.image));

  if (input.images && input.images.length > 1) {
    push("images", `[${input.images.map((url) => JSON.stringify(url)).join(", ")}]`);
  }

  const currentPrice = toNumberLiteral(input.currentPrice);
  push("currentPrice", currentPrice ?? "0 /* TODO: set a price */");

  const originalPrice = toNumberLiteral(input.originalPrice);
  if (originalPrice) push("originalPrice", originalPrice);

  push("affiliateUrl", JSON.stringify(input.affiliateUrl));

  if (input.sourceUrl) push("sourceUrl", JSON.stringify(input.sourceUrl));

  push("store", JSON.stringify(input.store));
  push("category", JSON.stringify(input.category));

  if (input.collection) push("collection", JSON.stringify(input.collection));

  if (input.audience) push("audience", JSON.stringify(input.audience));

  if (input.occasion) push("occasion", JSON.stringify(input.occasion));

  // Optional: no label = no badge on the card.
  if (input.recommendationLabel) push("recommendationLabel", JSON.stringify(input.recommendationLabel));
  push("description", JSON.stringify(input.description));

  const sizes = toStringArray(input.sizes);
  if (sizes.length > 0) push("sizes", `[${sizes.map((s) => JSON.stringify(s)).join(", ")}]`);

  const colors = toStringArray(input.colors);
  if (colors.length > 0) push("colors", `[${colors.map((c) => JSON.stringify(c)).join(", ")}]`);

  const sizeMeasurementsCode = toSizeMeasurementsCode(input.sizeMeasurements);
  if (sizeMeasurementsCode) push("sizeMeasurements", sizeMeasurementsCode);

  if (input.sizeNote) push("sizeNote", JSON.stringify(input.sizeNote));

  if (input.featured) push("featured", "true");

  return `  {\n${lines.join("\n")}\n  },`;
}

/** Copy/paste snippet for the "Generate Product Entry" backup flow — the object literal above with a leading paste-instruction comment. */
export function generateProductObjectCode(input: ProductCodeInput): string {
  return `// Paste into the \`products\` array in lib/data/products.ts\n${generateProductObjectLiteral(input)}`;
}
