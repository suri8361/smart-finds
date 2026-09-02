"use client";

import { useRef, useState } from "react";
import type { SizeMeasurementRow } from "@/lib/admin/productForm";

/**
 * Row/field state management for the "Size & Measurements" editor, shared by
 * the Add Product importer and Edit Product form. `onChange` is called on
 * every interactive edit (add/remove/update) — both consumers use it to
 * clear a stale save success/error banner; it's intentionally NOT called by
 * `replaceAll`, since that's used to bulk-load fresh data (e.g. right after
 * a URL import), not a user edit.
 */
export function useSizeMeasurementRows(initialRows: SizeMeasurementRow[] = [], onChange?: () => void) {
  const [rows, setRows] = useState<SizeMeasurementRow[]>(initialRows);
  const rowIdCounter = useRef(0);
  const nextId = () => `row-${rowIdCounter.current++}`;

  function addRow() {
    onChange?.();
    setRows((prev) => [...prev, { id: nextId(), size: "", measurements: [] }]);
  }

  function removeRow(rowId: string) {
    onChange?.();
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  }

  function updateSize(rowId: string, size: string) {
    onChange?.();
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, size } : row)));
  }

  function addField(rowId: string) {
    onChange?.();
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, measurements: [...row.measurements, { id: nextId(), key: "", value: "" }] } : row
      )
    );
  }

  function removeField(rowId: string, fieldId: string) {
    onChange?.();
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, measurements: row.measurements.filter((field) => field.id !== fieldId) } : row
      )
    );
  }

  function updateField(rowId: string, fieldId: string, patch: Partial<{ key: string; value: string }>) {
    onChange?.();
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              measurements: row.measurements.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)),
            }
          : row
      )
    );
  }

  function replaceAll(nextRows: SizeMeasurementRow[]) {
    setRows(nextRows);
  }

  return { rows, addRow, removeRow, updateSize, addField, removeField, updateField, replaceAll };
}
