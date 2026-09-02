"use client";

import { Field, inputClass } from "@/components/admin/adminFormPrimitives";

export interface SourceAffiliateUrlFieldsProps {
  sourceUrl: string;
  affiliateUrl: string;
  onSourceUrlChange: (value: string) => void;
  onAffiliateUrlChange: (value: string) => void;
}

/**
 * The two-URL pair shared by the Add Product importer and Edit Product
 * form's re-import section — kept deliberately separate so a change to one
 * never silently touches the other:
 *
 * - Source Product URL: fetched/scraped for product data only. Never shown
 *   publicly, never used as an outbound link.
 * - Affiliate URL: the exact link shoppers click via "View Find." Only ever
 *   set by what's typed here — an import/re-import never overwrites it once
 *   it has a value of its own (see AddProductImporter/EditProductForm).
 */
export function SourceAffiliateUrlFields({
  sourceUrl,
  affiliateUrl,
  onSourceUrlChange,
  onAffiliateUrlChange,
}: SourceAffiliateUrlFieldsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Source Product URL">
          <input
            type="url"
            value={sourceUrl}
            onChange={(event) => onSourceUrlChange(event.target.value)}
            placeholder="https://us.shein.com/..."
            className={inputClass}
          />
        </Field>
        <Field label="Affiliate URL">
          <input
            type="url"
            value={affiliateUrl}
            onChange={(event) => onAffiliateUrlChange(event.target.value)}
            placeholder="https://onelink.shein.com/..."
            className={inputClass}
          />
        </Field>
      </div>
      <p className="text-xs text-foreground/50">
        <strong>Source Product URL:</strong> regular retailer product page used for importing details.{" "}
        <strong>Affiliate URL:</strong> the link shoppers will actually visit.
      </p>
    </div>
  );
}
