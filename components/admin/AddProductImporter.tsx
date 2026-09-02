"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { GalleryImageManager } from "@/components/admin/GalleryImageManager";
import { ProductFormFields } from "@/components/admin/ProductFormFields";
import { SizeMeasurementsEditor } from "@/components/admin/SizeMeasurementsEditor";
import { SourceAffiliateUrlFields } from "@/components/admin/SourceAffiliateUrlFields";
import { ProductCodeOutput } from "@/components/admin/ProductCodeOutput";
import { useSizeMeasurementRows } from "@/components/admin/useSizeMeasurementRows";
import {
  buildProductCodeInput,
  EMPTY_PRODUCT_FORM,
  getMissingRequiredFields,
  sizeMeasurementRowsFromInput,
  slugify,
  type ProductFormState,
  type ScrapedImportData,
} from "@/lib/admin/productForm";
import { generateProductObjectCode, type SizeImportStatus, type SizeMeasurementInput } from "@/lib/admin/generateProductCode";
import { deriveStoreName } from "@/lib/admin/scrapeProduct";

type SaveState = "idle" | "saving" | "success" | "error";

export function AddProductImporter() {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [slugTouched, setSlugTouched] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [sizeImportInfo, setSizeImportInfo] = useState<{ status: SizeImportStatus; message: string } | null>(null);

  function resetSaveFeedback() {
    if (saveState !== "idle") {
      setSaveState("idle");
      setSaveMessage(null);
    }
  }

  const sizeRows = useSizeMeasurementRows([], resetSaveFeedback);

  function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    resetSaveFeedback();
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleNameChange(value: string) {
    resetSaveFeedback();
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    updateField("slug", slugify(value));
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

  async function handleImport() {
    const trimmedSourceUrl = form.sourceUrl.trim();
    if (!trimmedSourceUrl) {
      setFetchError("Paste a Source Product URL first.");
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    setWarnings([]);
    resetSaveFeedback();

    let clientStoreGuess = "";
    try {
      clientStoreGuess = deriveStoreName(new URL(trimmedSourceUrl).hostname);
    } catch {
      setFetchError("That doesn't look like a valid Source Product URL.");
      setIsLoading(false);
      return;
    }

    try {
      // Only ever fetches the Source Product URL — the Affiliate URL field
      // is never sent anywhere, only saved as-is.
      const response = await fetch("/api/admin/import-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedSourceUrl }),
      });
      const payload = await response.json();
      const data = payload.data as ScrapedImportData | undefined;

      setImages(data?.images ?? []);
      setGalleryImages([]);
      sizeRows.replaceAll(sizeMeasurementRowsFromInput(data?.sizeMeasurements, "scraped"));
      setSizeImportInfo(data?.sizeImportStatus && data.sizeImportMessage ? { status: data.sizeImportStatus, message: data.sizeImportMessage } : null);
      setForm((prev) => ({
        ...prev,
        sourceUrl: trimmedSourceUrl,
        // Only default the affiliate URL when it's still empty — never
        // overwrite one you've already typed in, here or on a re-import.
        affiliateUrl: prev.affiliateUrl.trim() ? prev.affiliateUrl : trimmedSourceUrl,
        name: data?.title ?? prev.name,
        slug: slugTouched ? prev.slug : slugify(data?.title ?? prev.name ?? ""),
        description: data?.description ?? prev.description,
        currentPrice: data?.currentPrice !== undefined ? String(data.currentPrice) : prev.currentPrice,
        originalPrice: data?.originalPrice !== undefined ? String(data.originalPrice) : prev.originalPrice,
        store: data?.store ?? clientStoreGuess ?? prev.store,
        image: data?.images?.[0] ?? prev.image,
        sizes: data?.sizes && data.sizes.length > 0 ? data.sizes.join(", ") : prev.sizes,
      }));

      if (!payload.success) {
        setFetchError(
          payload.error ?? "Couldn't automatically retrieve this page. You can still fill in the details manually below."
        );
      }
      setWarnings(payload.warnings ?? []);
    } catch {
      setFetchError("Couldn't reach the import service. You can still fill in the details manually below.");
      setForm((prev) => ({
        ...prev,
        sourceUrl: trimmedSourceUrl,
        affiliateUrl: prev.affiliateUrl.trim() ? prev.affiliateUrl : trimmedSourceUrl,
        store: clientStoreGuess || prev.store,
      }));
    } finally {
      setIsLoading(false);
    }
  }

  function handleGenerate() {
    setGeneratedCode(generateProductObjectCode(buildProductCodeInput(form, galleryImages, sizeRows.rows)));
  }

  async function handleAddToSmartFinds() {
    setSaveState("saving");
    setSaveMessage(null);
    try {
      const response = await fetch("/api/admin/save-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildProductCodeInput(form, galleryImages, sizeRows.rows)),
      });
      const payload = await response.json();
      if (payload.success) {
        setSaveState("success");
        setSavedSlug(payload.slug);
      } else {
        setSaveState("error");
        setSaveMessage(payload.message ?? "Couldn't add this product. Please try again.");
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
        <strong>Development tool — not intended for public use.</strong> This page and its API routes (including
        writing directly to <code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">lib/data/products.ts</code>) only work
        during local development (<code className="rounded bg-black/10 px-1 py-0.5 text-xs dark:bg-white/10">npm run dev</code>) — all are disabled in a production build.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-h1 font-semibold text-foreground">Add Product</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground/60">
            Paste a Source Product URL to try to pull in its title, price, images, sizes, and description. Nothing
            is saved until you click <strong>Add to Smart Finds</strong>, which writes the new product straight
            into <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">lib/data/products.ts</code> for
            you. If you&rsquo;d rather copy the code yourself, <strong>Generate Product Entry</strong> still works
            exactly as before.
          </p>
        </div>
        <Button href="/admin/products" variant="outline" size="sm">
          Manage Products
        </Button>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-card">
        <SourceAffiliateUrlFields
          sourceUrl={form.sourceUrl}
          affiliateUrl={form.affiliateUrl}
          onSourceUrlChange={(value) => updateField("sourceUrl", value)}
          onAffiliateUrlChange={(value) => updateField("affiliateUrl", value)}
        />
        <Button type="button" onClick={handleImport} disabled={isLoading} className="sm:w-56">
          {isLoading ? "Importing…" : "Import Product"}
        </Button>
        {fetchError ? <p className="text-sm text-red-600 dark:text-red-400">{fetchError}</p> : null}
        {warnings.length > 0 ? (
          <ul className="list-disc pl-5 text-sm text-foreground/60">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-h3 font-semibold text-foreground">Select photos</h2>
        <p className="text-sm text-foreground/60">
          {images.length > 0
            ? `${images.length} image${images.length === 1 ? "" : "s"} found. `
            : "No images found automatically — paste a URL below to add one manually. "}
          Click a photo to make it the <strong>primary</strong> (card) image — check the box on any others to
          include them in the product&rsquo;s photo gallery. Nothing is added automatically; only what you check
          here is saved.
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
        <ProductFormFields form={form} updateField={updateField} onNameChange={handleNameChange} onSlugChange={handleSlugChange} />
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
          <Button
            type="button"
            onClick={handleAddToSmartFinds}
            disabled={missingRequired.length > 0 || saveState === "saving"}
          >
            {saveState === "saving" ? "Adding…" : "Add to Smart Finds"}
          </Button>
          <Button type="button" variant="outline" onClick={handleGenerate} disabled={missingRequired.length > 0}>
            Generate Product Entry
          </Button>
        </div>

        {saveState === "success" && savedSlug ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
            <p className="font-semibold">Product added to Smart Finds</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Button href={`/products/${savedSlug}`} size="sm" variant="outline">
                View Product
              </Button>
              <Button href="/" size="sm" variant="outline">
                View Homepage
              </Button>
            </div>
          </div>
        ) : null}

        {saveState === "error" && saveMessage ? (
          <p className="text-sm text-red-600 dark:text-red-400">{saveMessage}</p>
        ) : null}
      </div>

      {generatedCode ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-h3 font-semibold text-foreground">Generated code</h2>
          <p className="text-sm text-foreground/60">
            Copy this and paste it as a new entry in the{" "}
            <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">products</code> array in{" "}
            <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">lib/data/products.ts</code>.
          </p>
          <ProductCodeOutput code={generatedCode} />
        </section>
      ) : null}
    </div>
  );
}
