/**
 * Client-safe (no fetch, no fs — pure string parsing) "Paste Size Chart"
 * parser for the Size & Measurements admin section. SHEIN's own size chart
 * is loaded client-side and blocked from the scraper by a CAPTCHA wall (see
 * lib/admin/scrapeProduct.ts), so this is the fast fallback: copy the size
 * chart text straight off the retailer's page and paste it here.
 *
 * Tries a few common copy/paste shapes, in order:
 *   1. Tab-separated rows (what most browsers produce copying an HTML table)
 *   2. Multi-space or comma-aligned rows (plain-text tables, some sites)
 *   3. One cell per line (also common — many sites' markup puts each <td>
 *      on its own line, so pasting collapses the table into a flat list)
 *
 * Whichever shape is detected, values are taken verbatim from the pasted
 * text — never parsed, converted, or guessed — and a column only ends up in
 * the result if its header was recognized as "Size" or a known measurement
 * name (lib/admin/measurementKeys.ts). Unrecognized columns are silently
 * ignored rather than guessed at.
 */

import type { SizeMeasurementInput } from "@/lib/admin/generateProductCode";
import {
  buildMeasurementsForRow,
  canonicalMeasurementKey,
  detectUnitFromHeaderText,
  groupColumnsByKey,
  SIZE_COLUMN_HINT,
  type MeasurementColumn,
} from "@/lib/admin/measurementKeys";

export interface ParseSizeChartResult {
  success: boolean;
  chart?: SizeMeasurementInput[];
  message: string;
}

function splitLines(rawText: string): string[] {
  return rawText
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** A delimiter guess is only trusted if the header actually splits into ≥2 cells AND most rows share that cell count — otherwise it's probably the wrong delimiter for this paste, not a malformed table. */
function splitByDelimiter(lines: string[], delimiter: string | RegExp): string[][] | undefined {
  const rows = lines.map((line) => line.split(delimiter).map((cell) => cell.trim()).filter(Boolean));
  if (rows[0].length < 2) return undefined;
  const headerLength = rows[0].length;
  const consistent = rows.filter((row) => row.length === headerLength).length;
  if (consistent < rows.length * 0.6) return undefined;
  return rows;
}

/** A line-per-cell HEADER cell is one that's literally recognizable as "Size" or a known measurement name. Data can't be told apart from a header by digit-presence alone — a bare size label like "S" or "M" has no digit, so that heuristic would wrongly swallow it into the header. */
function looksLikeHeaderCell(line: string): boolean {
  return SIZE_COLUMN_HINT.test(line) || canonicalMeasurementKey(line) !== undefined;
}

/** Handles the "one cell per line" paste shape: infers the column count from how many recognized header-word lines appear before the first line that isn't one (the first actual data cell — a size label or a measurement value), then chunks the rest into rows of that width. */
function splitByLinePerCell(lines: string[]): string[][] | undefined {
  let headerLength = 0;
  for (const line of lines) {
    if (!looksLikeHeaderCell(line)) break;
    headerLength++;
  }
  if (headerLength < 2) return undefined;
  const remaining = lines.length - headerLength;
  if (remaining < headerLength) return undefined;
  if (remaining % headerLength !== 0) return undefined;

  const rows: string[][] = [lines.slice(0, headerLength)];
  for (let i = headerLength; i < lines.length; i += headerLength) {
    rows.push(lines.slice(i, i + headerLength));
  }
  return rows;
}

function detectTable(lines: string[]): string[][] | undefined {
  return (
    splitByDelimiter(lines, "\t") ??
    splitByDelimiter(lines, /\s{2,}/) ??
    splitByDelimiter(lines, ",") ??
    splitByLinePerCell(lines)
  );
}

function buildChartFromTable(table: string[][]): ParseSizeChartResult {
  const header = table[0];
  const sizeColumnIndex = header.findIndex((cell) => SIZE_COLUMN_HINT.test(cell));
  if (sizeColumnIndex === -1) {
    return {
      success: false,
      message: 'Couldn\'t find a "Size" column in the pasted text — make sure the header row includes one (e.g. "Size").',
    };
  }

  const measurementColumns: MeasurementColumn[] = header
    .map((cell, index) => {
      if (index === sizeColumnIndex) return null;
      const key = canonicalMeasurementKey(cell);
      if (!key) return null;
      return { index, key, unit: detectUnitFromHeaderText(cell) };
    })
    .filter((entry): entry is MeasurementColumn => entry !== null);

  if (measurementColumns.length === 0) {
    return {
      success: false,
      message:
        "Found a Size column but no recognized measurement columns (waist, hip, bust, length, ...) — you can still add them manually below.",
    };
  }

  const columnsByKey = groupColumnsByKey(measurementColumns);
  const chart: SizeMeasurementInput[] = [];
  for (const row of table.slice(1)) {
    const size = row[sizeColumnIndex];
    if (!size) continue;
    const measurements = buildMeasurementsForRow(row, columnsByKey);
    if (Object.keys(measurements).length > 0) chart.push({ size, measurements });
  }

  if (chart.length === 0) {
    return {
      success: false,
      message: "Recognized the table structure but couldn't extract any size rows — double check the pasted text.",
    };
  }

  return {
    success: true,
    chart,
    message: `Parsed ${chart.length} size${chart.length === 1 ? "" : "s"} from the pasted text — review the rows below before saving.`,
  };
}

export function parseSizeChartText(rawText: string): ParseSizeChartResult {
  const lines = splitLines(rawText);
  if (lines.length < 2) {
    return { success: false, message: "Paste at least a header row and one size row." };
  }

  const table = detectTable(lines);
  if (!table || table.length < 2) {
    return {
      success: false,
      message:
        "Couldn't recognize a table in the pasted text — try pasting it exactly as copied from the retailer's size chart, or add sizes manually below.",
    };
  }

  return buildChartFromTable(table);
}
