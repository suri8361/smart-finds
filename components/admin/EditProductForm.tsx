"use client";

import { useState } from "react";
import type { Product } from "@/types/catalog";
import { Button } from "@/components/ui/Button";
import { GalleryImageManager } from "@/components/admin/GalleryImageManager";
import { ProductFormFields } from "@/components/admin/ProductFormFields";
import { SizeMeasurementsEditor } from "@/components/admin/SizeMeasurementsEditor";
import { SourceAffiliateUrlFields } from "@/components/admin/SourceAffiliateUrlFields";
import { useSizeMeasurementRows } from "@/components/admin/useSizeMeasurementRows";
import {
  buildProductCodeInput,
  formStateFromProduct,
  galleryImagesFromProduct,
  getMissingRequiredFields,
  imageCandidatesFromProduct,
  sizeMeasurementRowsFromInput,
  type ProductFormState,
  type ScrapedImportData,
} from "@/lib/admin/productForm";
import type { SizeImportStatus, SizeMeasurementInput } from "@/lib/admin/generateProductCode";

type SaveState = "idle" | "saving" | "success" | "error";

/**
 * /admin/products/[slug]/edit's form — built from the same shared field
 * grid, gallery manager, and size-measurements editor as the Add Product
 * importer (components/admin/AddProductImporter.tsx), pre-filled from the
 * existing product instead of a URL scrape. Saving calls
 * app/api/admin/update-product/route.ts, which only touches this one
 * product's entry in lib/data/products.ts.
 */
export function EditProductForm({ product }: { product: Product }) {
  const [form, setForm] = useState<ProductFormState>(() => formStateFromProduct(product));
  const [images, setImages] = useState<string[]>(() => imageCandidatesFromProduct(product));
  const [galleryImages, setGalleryImages] = useState<string[]>(() => galleryImagesFromProduct(product));
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [isReimporting, setIsReimporting] = useState(false);
  const [reimportError, setReimportError] = useState<string | null>(null);
  const [reimportWarnings, setReimportWarnings] = useState<string[]>([]);
  const [sizeImportInfo, setSizeImportInfo] = useState<{ status: SizeImportStatus; message: string } | null>(null);

  function resetSaveFeedback() {
    if (saveState !== "idle") {
      setSaveState("idle");
      setSaveMessage(null);
    }
  }

  const sizeRows = useSizeMeasurementRows(sizeMeasurementRowsFromInput(product.sizeMeasurements, "preset"), resetSaveFeedback);

  function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    resetSaveFeedback();
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleGalleryImage(src: string) {
    resetSaveFeedback();
    setGalleryImages((prev) => (prev.includes(src) ? prev.filter((url) => url !== src) : [...prev, src]));
  }

  function addImageCandidate(candidate: string) {
    resetSaveFeedback();
    setImages((prev) => (prev.includes(candidate) ? prev : [...prev, candidate]));
  }

  function handleParsedSizeChart(chart: SizeMeasurementInput[]) {
    resetSaveFeedback();
    sizeRows.replaceAll(sizeMeasurementRowsFromInput(chart, "pasted"));
  }

  async function handleReimport() {
    const trimmedSourceUrl = form.sourceUrl.trim();
    if (!trimmedSourceUrl) return;

    setIsReimporting(true);
    setReimportError(null);
    setReimportWarnings([]);
    resetSaveFeedback();

    try {
      const response = await fetch("/api/admin/import-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedSourceUrl }),
      });
      const payload = await response.json();
      const data = payload.data as ScrapedImportData | undefined;

      // Deliberately conservative: this only ever ADDS newly-found photos to
      // the candidate pool (never drops your existing ones), and only
      // touches price/sizes/measurements when something new was actually
      // found — an empty re-scrape (e.g. the retailer blocked the request)
      // must never silently wipe out data you already curated. Name,
      // description, store, category, audience, etc. are never touched by
      // re-import at all.
      if (data?.images && data.images.length > 0) {
        setImages((prev) => Array.from(new Set([...prev, ...data.images!])));
      }
      if (data?.sizeMeasurements && data.sizeMeasurements.length > 0) {
        sizeRows.replaceAll(sizeMeasurementRowsFromInput(data.sizeMeasurements, "reimport"));
      }
      setSizeImportInfo(
        data?.sizeImportStatus && data.sizeImportMessage ? { status: data.sizeImportStatus, message: data.sizeImportMessage } : null
      );

      setForm((prev) => ({
        ...prev,
        sourceUrl: trimmedSourceUrl,
        // Never touched unless it's currently empty — re-import must not
        // change a saved affiliate URL you didn't just edit yourself.
        affiliateUrl: prev.affiliateUrl.trim() ? prev.affiliateUrl : trimmedSourceUrl,
        currentPrice: data?.currentPrice !== undefined ? String(data.currentPrice) : prev.currentPrice,
        originalPrice: data?.originalPrice !== undefined ? String(data.originalPrice) : prev.originalPrice,
        sizes: data?.sizes && data.sizes.length > 0 ? data.sizes.join(", ") : prev.sizes,
      }));

      if (!payload.success) {
        setReimportError(payload.error ?? "Couldn't automatically retrieve this page.");
      }
      setReimportWarnings(payload.warnings ?? []);
    } catch {
      setReimportError("Couldn't reach the import service. Please try again.");
    } finally {
      setIsReimporting(false);
    }
  }

  async function handleSave() {
    setSaveState("saving");
    setSaveMessage(null);
    try {
      const response = await fetch("/api/admin/update-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalSlug: product.slug,
          ...buildProductCodeInput(form, galleryImages, sizeRows.rows),
        }),
      });
      const payload = await response.json();
      if (payload.success) {
        setSaveState("success");
        setSavedSlug(payload.slug);
      } else {
        setSaveState("error");
        setSaveMessage(payload.message ?? "Couldn't save these changes. Please try again.");
      }
    } catch {
      setSaveState("error");
      setSaveMessage("Couldn't reach the server. Please try again.");
    }
  }

  const missingRequired = getMissingRequiredFields(form);

  return (
    <div className="flex flex-col gap-10 py-10">
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
        <strong>Development tool — not intended for public use.</strong> This page and its API routes only work
        during local development (<code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">npm run dev</code>) — all are disabled in a production build.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 font-semibold text-foreground">Edit Product</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground/60">
            Editing <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">{product.slug}</code>. Saving
            writes the changes straight into{" "}
            <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">lib/data/products.ts</code> — only this
            product&rsquo;s entry is touched, every other product is left exactly as-is.
          </p>
        </div>
        <Button href="/admin/products" variant="outline" size="sm">
          Back to Products
        </Button>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <SourceAffiliateUrlFields
          sourceUrl={form.sourceUrl}
          affiliateUrl={form.affiliateUrl}
          onSourceUrlChange={(value) => updateField("sourceUrl", value)}
          onAffiliateUrlChange={(value) => updateField("affiliateUrl", value)}
        />
        <div>
          <Button
            type="button"
            variant="outline"
            onClick={handleReimport}
            disabled={!form.sourceUrl.trim() || isReimporting}
            className="sm:w-56"
          >
            {isReimporting ? "Re-importing…" : "Re-import retailer data"}
          </Button>
          <p className="mt-2 text-xs text-foreground/50">
            Re-fetches the Source Product URL and fills in any newly-found price, photos, sizes, and measurements
            for you to review below — nothing is saved until you click <strong>Save Changes</strong>, and your
            affiliate URL is never touched by this.
          </p>
        </div>
        {reimportError ? <p className="text-sm text-red-600 dark:text-red-400">{reimportError}</p> : null}
        {reimportWarnings.length > 0 ? (
          <ul className="list-disc pl-5 text-sm text-foreground/60">
            {reimportWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-h3 font-semibold text-foreground">Photos</h2>
        <p className="text-sm text-foreground/60">
          Click a photo to make it the <strong>primary</strong> (card) image — check the box on any others to
          include them in the product&rsquo;s photo gallery, or paste a new image URL below to add one.
        </p>
        <GalleryImageManager
          images={images}
          onAddImage={addImageCandidate}
          primary={form.image}
          onSelectPrimary={(src) => updateField("image", src)}
          galleryImages={galleryImages}
          onToggleGalleryImage={toggleGalleryImage}
        />
      </section>

      <section className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <h2 className="font-display text-h3 font-semibold text-foreground">Product details</h2>
        <ProductFormFields form={form} updateField={updateField} />
      </section>

      <section className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <SizeMeasurementsEditor
          rows={sizeRows.rows}
          onAddRow={sizeRows.addRow}
          onRemoveRow={sizeRows.removeRow}
          onUpdateSize={sizeRows.updateSize}
          onAddField={sizeRows.addField}
          onRemoveField={sizeRows.removeField}
          onUpdateField={sizeRows.updateField}
          sizeNote={form.sizeNote}
          onSizeNoteChange={(value) => updateField("sizeNote", value)}
          importStatus={sizeImportInfo}
          onParsedChart={handleParsedSizeChart}
        />
      </section>

      <div className="flex flex-col gap-3">
        {missingRequired.length > 0 ? (
          <p className="text-xs text-foreground/50">Missing: {missingRequired.join(", ")}</p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={handleSave} disabled={missingRequired.length > 0 || saveState === "saving"}>
            {saveState === "saving" ? "Saving…" : "Save Changes"}
          </Button>
        </div>

        {saveState === "success" && savedSlug ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
            <p className="font-semibold">Product updated</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button href={`/products/${savedSlug}`} size="sm" variant="outline">
                View Product
              </Button>
              <Button href="/admin/products" size="sm" variant="outline">
                Back to Products
              </Button>
              <Button href="/" size="sm" variant="outline">
                Homepage
              </Button>
            </div>
          </div>
        ) : null}

        {saveState === "error" && saveMessage ? (
          <p className="text-sm text-red-600 dark:text-red-400">{saveMessage}</p>
        ) : null}
      </div>
    </div>
  );
}
