import type { AudienceType, OccasionType, Product, ProductCategoryType, SelectionReasonType } from "@/types/catalog";
import type { ProductCodeInput, SizeImportStatus, SizeMeasurementInput } from "@/lib/admin/generateProductCode";

/** Shape of `payload.data` from POST /api/admin/import-product — shared by the Add flow's import and the Edit flow's re-import so both parse the response the same way. */
export interface ScrapedImportData {
  title?: string;
  description?: string;
  currentPrice?: number;
  originalPrice?: number;
  images?: string[];
  store?: string;
  sizeMeasurements?: SizeMeasurementInput[];
  sizes?: string[];
  sizeImportStatus?: SizeImportStatus;
  sizeImportMessage?: string;
}

/**
 * Shared client-side form shape used by both the Add Product importer
 * (components/admin/AddProductImporter.tsx) and the Edit Product form
 * (components/admin/EditProductForm.tsx) — everything here is plain string
 * form state, converted to a real `Product`-shaped payload only at save time
 * via `buildProductCodeInput`.
 */
export interface ProductFormState {
  slug: string;
  name: string;
  image: string;
  currentPrice: string;
  originalPrice: string;
  affiliateUrl: string;
  /** The retailer page importing/re-import fetches from — never used as the outbound link and never shown publicly. */
  sourceUrl: string;
  store: string;
  category: ProductCategoryType | "";
  collection: string;
  audience: AudienceType | "";
  occasion: OccasionType | "";
  recommendationLabel: SelectionReasonType | "";
  description: string;
  sizes: string;
  colors: string;
  sizeNote: string;
  featured: boolean;
}

export const EMPTY_PRODUCT_FORM: ProductFormState = {
  slug: "",
  name: "",
  image: "",
  currentPrice: "",
  originalPrice: "",
  affiliateUrl: "",
  sourceUrl: "",
  store: "",
  category: "",
  collection: "",
  audience: "",
  occasion: "",
  recommendationLabel: "",
  description: "",
  sizes: "",
  colors: "",
  sizeNote: "",
  featured: false,
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** One editable measurement field (key/value) within a size row — an ordered, freely-renamable list rather than a Record, since that's what an add/remove/edit UI needs. */
export interface SizeMeasurementFieldRow {
  id: string;
  key: string;
  value: string;
}

/** One editable row in the Size & Measurements section. */
export interface SizeMeasurementRow {
  id: string;
  size: string;
  measurements: SizeMeasurementFieldRow[];
}

export const COMMON_MEASUREMENT_LABELS = [
  "waist",
  "hip",
  "bust",
  "chest",
  "length",
  "shoulder",
  "sleeveLength",
  "inseam",
  "thigh",
  "rise",
  "hem",
];

/** Turns a real product's (or a scrape result's) `{size, measurements}[]` into editable rows. `idPrefix` just needs to be distinct from whatever prefix live "+ Add size" clicks use (see useSizeMeasurementRows) so ids never collide. */
export function sizeMeasurementRowsFromInput(
  rows: { size: string; measurements: Record<string, string> }[] | undefined,
  idPrefix: string
): SizeMeasurementRow[] {
  return (rows ?? []).map((row, rowIndex) => ({
    id: `${idPrefix}-size-${rowIndex}`,
    size: row.size,
    measurements: Object.entries(row.measurements).map(([key, value], fieldIndex) => ({
      id: `${idPrefix}-field-${rowIndex}-${fieldIndex}`,
      key,
      value,
    })),
  }));
}

/** Pre-fills a `ProductFormState` from an existing product, for the edit form. */
export function formStateFromProduct(product: Product): ProductFormState {
  return {
    slug: product.slug,
    name: product.name,
    image: product.image ?? "",
    currentPrice: String(product.currentPrice),
    originalPrice: product.originalPrice !== undefined ? String(product.originalPrice) : "",
    affiliateUrl: product.affiliateUrl,
    sourceUrl: product.sourceUrl ?? "",
    store: product.store,
    category: product.category,
    collection: product.collection ?? "",
    audience: product.audience ?? "",
    occasion: product.occasion ?? "",
    recommendationLabel: product.recommendationLabel,
    description: product.description,
    sizes: product.sizes?.join(", ") ?? "",
    colors: product.colors?.join(", ") ?? "",
    sizeNote: product.sizeNote ?? "",
    featured: product.featured ?? false,
  };
}

/** The product's gallery photos other than the primary — the initial "checked" state for GalleryImageManager on the edit form. */
export function galleryImagesFromProduct(product: Product): string[] {
  if (!product.images) return [];
  return product.images.filter((url) => url !== product.image);
}

/** All of a product's known photos (primary + gallery), deduped — the initial thumbnail candidates for GalleryImageManager on the edit form. */
export function imageCandidatesFromProduct(product: Product): string[] {
  return Array.from(new Set([product.image, ...(product.images ?? [])].filter((value): value is string => Boolean(value))));
}

export function getMissingRequiredFields(form: ProductFormState): string[] {
  return [
    !form.slug && "slug",
    !form.name && "name",
    !form.currentPrice && "current price",
    !form.affiliateUrl && "affiliate URL",
    !form.store && "store",
    !form.category && "category",
    !form.recommendationLabel && "recommendation label",
    !form.description && "description",
  ].filter((value): value is string => Boolean(value));
}

/** Shared by both flows — turns form state + the current gallery/measurement selections into the payload sent to the save/update API (and, for the Add flow, the "Generate Product Entry" code snippet). */
export function buildProductCodeInput(
  form: ProductFormState,
  galleryImages: string[],
  sizeRows: SizeMeasurementRow[]
): ProductCodeInput {
  // Primary is always part of the gallery, first — matches the "clearly
  // marked" primary image shown in the picker and what the detail page's
  // gallery expects (its first entry is treated as the default photo).
  const gallery = form.image ? [form.image, ...galleryImages.filter((url) => url !== form.image)] : galleryImages;

  const sizeMeasurements: SizeMeasurementInput[] = sizeRows
    .filter((row) => row.size.trim())
    .map((row) => ({
      size: row.size.trim(),
      measurements: Object.fromEntries(
        row.measurements
          .filter((field) => field.key.trim() && field.value.trim())
          .map((field) => [field.key.trim(), field.value.trim()])
      ),
    }))
    .filter((row) => Object.keys(row.measurements).length > 0);

  return {
    slug: form.slug,
    name: form.name,
    image: form.image || undefined,
    images: gallery.length > 1 ? gallery : undefined,
    currentPrice: form.currentPrice,
    originalPrice: form.originalPrice || undefined,
    // Passed through exactly as typed — never derived or rewritten.
    affiliateUrl: form.affiliateUrl,
    sourceUrl: form.sourceUrl || undefined,
    store: form.store,
    category: form.category,
    collection: form.collection || undefined,
    audience: form.audience || undefined,
    occasion: form.occasion || undefined,
    recommendationLabel: form.recommendationLabel,
    description: form.description,
    sizes: form.sizes,
    colors: form.colors,
    sizeMeasurements: sizeMeasurements.length > 0 ? sizeMeasurements : undefined,
    sizeNote: form.sizeNote || undefined,
    featured: form.featured,
  };
}
