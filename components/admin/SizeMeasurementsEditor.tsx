"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/admin/adminFormPrimitives";
import { COMMON_MEASUREMENT_LABELS, type SizeMeasurementRow } from "@/lib/admin/productForm";
import type { SizeImportStatus, SizeMeasurementInput } from "@/lib/admin/generateProductCode";
import { parseSizeChartText } from "@/lib/admin/parseSizeChart";

const IMPORT_STATUS_STYLES: Record<SizeImportStatus, string> = {
  measurements: "text-emerald-700 dark:text-emerald-400",
  sizes_only: "text-amber-700 dark:text-amber-400",
  blocked: "text-red-600 dark:text-red-400",
  not_available: "text-foreground/60",
};

export interface SizeMeasurementsEditorProps {
  rows: SizeMeasurementRow[];
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onUpdateSize: (rowId: string, size: string) => void;
  onAddField: (rowId: string) => void;
  onRemoveField: (rowId: string, fieldId: string) => void;
  onUpdateField: (rowId: string, fieldId: string, patch: Partial<{ key: string; value: string }>) => void;
  sizeNote: string;
  onSizeNoteChange: (value: string) => void;
  /** Result of the last import/re-import attempt for this field specifically, e.g. "Size chart imported from SHEIN." Omit/null when nothing has been imported yet. */
  importStatus?: { status: SizeImportStatus; message: string } | null;
  /** Called with the parsed chart when "Parse Size Chart" succeeds — the caller is responsible for turning it into rows (see sizeMeasurementRowsFromInput) and replacing the current ones. Never called on a failed parse. */
  onParsedChart: (chart: SizeMeasurementInput[]) => void;
}

/**
 * The "Size & Measurements" editor shared by the Add Product importer and
 * Edit Product form — add/remove size rows, add/remove/edit measurement
 * fields per row, plus an optional note. Purely controlled; row/field state
 * lives in the caller via `useSizeMeasurementRows`.
 */
export function SizeMeasurementsEditor({
  rows,
  onAddRow,
  onRemoveRow,
  onUpdateSize,
  onAddField,
  onRemoveField,
  onUpdateField,
  sizeNote,
  onSizeNoteChange,
  importStatus,
  onParsedChart,
}: SizeMeasurementsEditorProps) {
  const [showPastePanel, setShowPastePanel] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [parseMessage, setParseMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleParse() {
    const result = parseSizeChartText(pasteText);
    if (result.success && result.chart) {
      onParsedChart(result.chart);
      setParseMessage({ type: "success", text: result.message });
    } else {
      // Pasted text is deliberately left untouched on failure so it can be corrected and re-tried.
      setParseMessage({ type: "error", text: result.message });
    }
  }

  return (
    <>
      <div>
        <h2 className="font-display text-h3 font-semibold text-foreground">Size &amp; Measurements</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Optional — for clothing items where you have real measurements from the retailer&rsquo;s size chart.
          Leave this section empty for products that don&rsquo;t need it.
        </p>
        {importStatus ? (
          <p className={cn("mt-2 text-xs font-medium", IMPORT_STATUS_STYLES[importStatus.status])}>
            {importStatus.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setShowPastePanel((prev) => !prev)}
        >
          {showPastePanel ? "Hide Paste Size Chart" : "Paste Size Chart"}
        </Button>

        {showPastePanel ? (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-muted p-4">
            <textarea
              value={pasteText}
              onChange={(event) => {
                setPasteText(event.target.value);
                setParseMessage(null);
              }}
              rows={6}
              placeholder={'Size\tWaist\tHip\tLength\nS\t27.6"\t39.4"\t36.2"\nM\t29.1"\t40.9"\t36.6"'}
              className={cn(inputClass, "font-mono text-xs")}
            />
            <p className="text-xs text-foreground/50">Tip: Copy the retailer&rsquo;s size chart and paste it here.</p>
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={handleParse} disabled={!pasteText.trim()}>
              Parse Size Chart
            </Button>
            {parseMessage ? (
              <p
                className={cn(
                  "text-xs font-medium",
                  parseMessage.type === "success" ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}
              >
                {parseMessage.text}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {rows.length > 0 ? (
        <div className="flex flex-col gap-4">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface-muted p-4">
              <div className="flex items-end gap-3">
                <Field label="Size label">
                  <input
                    value={row.size}
                    onChange={(event) => onUpdateSize(row.id, event.target.value)}
                    placeholder="S, M, 8, One Size…"
                    className={inputClass}
                  />
                </Field>
                <Button type="button" variant="ghost" size="sm" onClick={() => onRemoveRow(row.id)}>
                  Remove size
                </Button>
              </div>

              {row.measurements.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {row.measurements.map((field) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <input
                        value={field.key}
                        onChange={(event) => onUpdateField(row.id, field.id, { key: event.target.value })}
                        placeholder="waist"
                        list="measurement-key-suggestions"
                        className={cn(inputClass, "sm:w-40")}
                      />
                      <input
                        value={field.value}
                        onChange={(event) => onUpdateField(row.id, field.id, { value: event.target.value })}
                        placeholder={'27.6" or 70cm'}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveField(row.id, field.id)}
                        aria-label="Remove measurement"
                        className="shrink-0 rounded-md p-2 text-foreground/50 hover:bg-surface hover:text-red-600"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onAddField(row.id)}>
                + Add measurement
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <datalist id="measurement-key-suggestions">
        {COMMON_MEASUREMENT_LABELS.map((label) => (
          <option key={label} value={label} />
        ))}
      </datalist>

      <Button type="button" variant="outline" className="w-fit" onClick={onAddRow}>
        + Add size
      </Button>

      <Field label="Size note (optional)">
        <input
          value={sizeNote}
          onChange={(event) => onSizeNoteChange(event.target.value)}
          placeholder="Measurements are from the retailer's size chart. Check the current product page before ordering."
          className={inputClass}
        />
      </Field>
    </>
  );
}
