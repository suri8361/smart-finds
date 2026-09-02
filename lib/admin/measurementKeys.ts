/**
 * Shared measurement-key matching, unit detection, and cm/in combination —
 * used by both the SHEIN/retailer scraper (lib/admin/scrapeProduct.ts) and
 * the manual "Paste Size Chart" parser (lib/admin/parseSizeChart.ts), so the
 * two ways of getting sizing data into the app agree on what a "waist"
 * column looks like and never duplicate this logic.
 */

/** A canonical `Size` header/key detector — matches "Size", "size_name", "US Size", etc. */
export const SIZE_COLUMN_HINT = /\bsize\b/i;

/** Matches a JSON/JS key that names the size itself, e.g. `size`, `size_name`, `sizeLabel`, `attr_value_name` (a common SHEIN-style SKU attribute key). */
export const SIZE_LABEL_KEY_HINT = /^(size|size_?name|sizeLabel|attr_?value_?name)$/i;

const MEASUREMENT_ALIASES: { key: string; pattern: RegExp }[] = [
  { key: "waist", pattern: /waist/i },
  { key: "hip", pattern: /hips?/i },
  { key: "bust", pattern: /bust/i },
  { key: "chest", pattern: /chest/i },
  { key: "length", pattern: /length/i },
  { key: "shoulder", pattern: /shoulder/i },
  { key: "sleeveLength", pattern: /sleeve/i },
  { key: "inseam", pattern: /inseam/i },
  { key: "thigh", pattern: /thigh/i },
  { key: "rise", pattern: /rise/i },
  { key: "hem", pattern: /hem/i },
];

export function canonicalMeasurementKey(rawKey: string): string | undefined {
  return MEASUREMENT_ALIASES.find(({ pattern }) => pattern.test(rawKey))?.key;
}

/** Header/cell text has spaces/punctuation, so word-boundary matching is safe here (e.g. "Waist (cm)"). */
export function detectUnitFromHeaderText(headerText: string): "cm" | "in" | undefined {
  if (/\b(?:cm|centimeters?)\b/i.test(headerText)) return "cm";
  if (/\b(?:in|inch(?:es)?)\b/i.test(headerText) || headerText.includes('"')) return "in";
  return undefined;
}

/** JSON/JS keys are camelCase or snake_case with no delimiters, so this only checks the END of the key (avoids "inseam" false-matching a bare /in/ check). */
export function detectUnitFromJsonKey(rawKey: string): "cm" | "in" | undefined {
  if (/(?:_cm|cm)$/i.test(rawKey)) return "cm";
  if (/(?:_in|_inch|inch|in)$/i.test(rawKey)) return "in";
  return undefined;
}

/** Combines separate cm/in values for the same measurement into one string ("70cm / 27.6in") when both are found — preserves each side exactly as supplied, never reformats or converts either one. */
export function mergeUnitPairs(
  directValues: Record<string, string>,
  unitValues: Record<string, { cm?: string; in?: string }>
): Record<string, string> {
  const measurements: Record<string, string> = { ...directValues };
  for (const [key, pair] of Object.entries(unitValues)) {
    if (measurements[key]) continue;
    if (pair.cm && pair.in) measurements[key] = `${pair.cm} / ${pair.in}`;
    else if (pair.cm) measurements[key] = pair.cm;
    else if (pair.in) measurements[key] = pair.in;
  }
  return measurements;
}

export interface MeasurementColumn {
  index: number;
  key: string;
  unit: "cm" | "in" | undefined;
}

/** Groups a flat list of matched measurement columns by canonical key — a "waist" key may have two columns (a cm one and an in one) that need combining per row. */
export function groupColumnsByKey(columns: MeasurementColumn[]): Map<string, MeasurementColumn[]> {
  const columnsByKey = new Map<string, MeasurementColumn[]>();
  for (const column of columns) {
    const list = columnsByKey.get(column.key) ?? [];
    list.push(column);
    columnsByKey.set(column.key, list);
  }
  return columnsByKey;
}

/** Builds one row's `measurements` record from its raw cells, combining cm/in column pairs and falling back to whichever single column has a value otherwise. Never fabricates — a column with no cell value for this row is simply omitted. */
export function buildMeasurementsForRow(row: string[], columnsByKey: Map<string, MeasurementColumn[]>): Record<string, string> {
  const measurements: Record<string, string> = {};
  for (const [key, columns] of columnsByKey) {
    if (columns.length === 1) {
      const value = row[columns[0].index];
      if (value) measurements[key] = value;
      continue;
    }
    const cmValue = row[columns.find((c) => c.unit === "cm")?.index ?? -1];
    const inValue = row[columns.find((c) => c.unit === "in")?.index ?? -1];
    if (cmValue && inValue) measurements[key] = `${cmValue} / ${inValue}`;
    else if (cmValue) measurements[key] = cmValue;
    else if (inValue) measurements[key] = inValue;
    else {
      const fallback = columns.map((c) => row[c.index]).find(Boolean);
      if (fallback) measurements[key] = fallback;
    }
  }
  return measurements;
}
