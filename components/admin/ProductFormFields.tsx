"use client";

import { productCategories } from "@/lib/data/productCategories";
import { collections } from "@/lib/data/collections";
import { audiences } from "@/lib/data/audiences";
import { occasions } from "@/lib/data/occasions";
import { RECOMMENDATION_LABELS } from "@/components/product/RecommendationBadge";
import type { AudienceType, OccasionType, ProductCategoryType, SelectionReasonType } from "@/types/catalog";
import { Field, inputClass } from "@/components/admin/adminFormPrimitives";
import { slugify, type ProductFormState } from "@/lib/admin/productForm";

export interface ProductFormFieldsProps {
  form: ProductFormState;
  updateField: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
  /** Override for the name field's onChange — the Add flow uses this to auto-derive the slug until it's manually touched. Defaults to a plain `updateField("name", value)`. */
  onNameChange?: (value: string) => void;
  /** Override for the slug field's onChange — the Add flow uses this to mark the slug "touched" so name-driven auto-fill stops. Defaults to `updateField("slug", slugify(value))`. */
  onSlugChange?: (value: string) => void;
}

/**
 * The "product details" field grid shared by the Add Product importer
 * (components/admin/AddProductImporter.tsx) and the Edit Product form
 * (components/admin/EditProductForm.tsx) — every field the two forms have
 * in common. Callers wrap this in their own `<section>`/heading.
 */
export function ProductFormFields({ form, updateField, onNameChange, onSlugChange }: ProductFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name">
          <input
            value={form.name}
            onChange={(event) => (onNameChange ? onNameChange(event.target.value) : updateField("name", event.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Slug">
          <input
            value={form.slug}
            onChange={(event) =>
              onSlugChange ? onSlugChange(event.target.value) : updateField("slug", slugify(event.target.value))
            }
            className={inputClass}
          />
        </Field>
        <Field label="Current price (USD)">
          <input
            type="number"
            step="0.01"
            value={form.currentPrice}
            onChange={(event) => updateField("currentPrice", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Original price (optional)">
          <input
            type="number"
            step="0.01"
            value={form.originalPrice}
            onChange={(event) => updateField("originalPrice", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Store">
          <input value={form.store} onChange={(event) => updateField("store", event.target.value)} className={inputClass} />
        </Field>
        <Field label="Category">
          <select
            value={form.category}
            onChange={(event) => updateField("category", event.target.value as ProductCategoryType | "")}
            className={inputClass}
          >
            <option value="">Choose a category…</option>
            <optgroup label="Fashion / Clothing">
              {productCategories
                .filter((category) => category.group === "fashion-style")
                .map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Everything else">
              {productCategories
                .filter((category) => category.group !== "fashion-style")
                .map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
            </optgroup>
          </select>
        </Field>
        <Field label="Collection (optional)">
          <select value={form.collection} onChange={(event) => updateField("collection", event.target.value)} className={inputClass}>
            <option value="">— None —</option>
            {collections.map((collection) => (
              <option key={collection.slug} value={collection.slug}>
                {collection.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Audience (optional)">
          <select
            value={form.audience}
            onChange={(event) => updateField("audience", event.target.value as AudienceType | "")}
            className={inputClass}
          >
            <option value="">— None —</option>
            {audiences.map((audience) => (
              <option key={audience.value} value={audience.value}>
                {audience.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Occasion (optional)">
          <select
            value={form.occasion}
            onChange={(event) => updateField("occasion", event.target.value as OccasionType | "")}
            className={inputClass}
          >
            <option value="">— None —</option>
            {occasions.map((occasion) => (
              <option key={occasion.value} value={occasion.value}>
                {occasion.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Recommendation label">
          <select
            value={form.recommendationLabel}
            onChange={(event) => updateField("recommendationLabel", event.target.value as SelectionReasonType)}
            className={inputClass}
          >
            <option value="">Choose a label…</option>
            {Object.entries(RECOMMENDATION_LABELS).map(([value, { text }]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sizes (comma-separated, optional)">
          <input
            value={form.sizes}
            onChange={(event) => updateField("sizes", event.target.value)}
            placeholder="S, M, L, XL"
            className={inputClass}
          />
        </Field>
        <Field label="Colors (comma-separated, optional)">
          <input
            value={form.colors}
            onChange={(event) => updateField("colors", event.target.value)}
            placeholder="Black, White"
            className={inputClass}
          />
        </Field>
      </div>

      {form.recommendationLabel === "personally_tried" ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Only use &ldquo;Personally Tried&rdquo; if someone on your team has actually used this product.
        </p>
      ) : null}

      {form.audience ? (
        <p className="text-xs text-foreground/50">
          Audience only applies to clothing/fashion products — leave it set to &ldquo;None&rdquo; for anything else.
        </p>
      ) : null}

      {form.occasion ? (
        <p className="text-xs text-foreground/50">
          Occasion only applies to clothing/fashion products — leave it set to &ldquo;None&rdquo; for anything
          else.
        </p>
      ) : null}

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          rows={3}
          className={inputClass}
        />
      </Field>

      <label className="inline-flex w-fit items-center gap-2 text-sm text-foreground">
        <input type="checkbox" checked={form.featured} onChange={(event) => updateField("featured", event.target.checked)} />
        Featured (show in homepage &ldquo;Top Picks&rdquo;)
      </label>
    </>
  );
}
