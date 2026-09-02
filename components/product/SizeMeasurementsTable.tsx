import type { SizeMeasurement } from "@/types/catalog";

const PREFERRED_COLUMN_ORDER = [
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

const COLUMN_LABELS: Record<string, string> = {
  waist: "Waist",
  hip: "Hip",
  bust: "Bust",
  chest: "Chest",
  length: "Length",
  shoulder: "Shoulder",
  sleeveLength: "Sleeve Length",
  inseam: "Inseam",
  thigh: "Thigh",
  rise: "Rise",
  hem: "Hem",
};

function toColumnLabel(key: string): string {
  return COLUMN_LABELS[key] ?? key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (char) => char.toUpperCase());
}

export interface SizeMeasurementsTableProps {
  sizeMeasurements: SizeMeasurement[];
  sizeNote?: string;
}

/**
 * "Size & Measurements" section on the product detail page — a responsive
 * table of per-size measurements. Only columns that actually have a value
 * on at least one row are shown, since `measurements` keys are free-form
 * and vary by clothing type (a skirt won't have "sleeveLength", a sweater
 * won't have "inseam", etc.).
 */
export function SizeMeasurementsTable({ sizeMeasurements, sizeNote }: SizeMeasurementsTableProps) {
  const presentKeys = new Set<string>();
  for (const row of sizeMeasurements) {
    for (const [key, value] of Object.entries(row.measurements)) {
      if (value && value.trim()) presentKeys.add(key);
    }
  }
  if (presentKeys.size === 0) return null;

  const orderedKeys = [
    ...PREFERRED_COLUMN_ORDER.filter((key) => presentKeys.has(key)),
    ...[...presentKeys].filter((key) => !PREFERRED_COLUMN_ORDER.includes(key)),
  ];

  return (
    <section className="flex flex-col gap-4 border-t border-border pt-10">
      <h2 className="font-display text-h2 font-semibold text-foreground">Size &amp; Measurements</h2>
      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted">
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Size
              </th>
              {orderedKeys.map((key) => (
                <th key={key} scope="col" className="px-4 py-3 font-semibold text-foreground">
                  {toColumnLabel(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizeMeasurements.map((row, rowIndex) => (
              <tr key={`${row.size}-${rowIndex}`} className="border-b border-border/60 last:border-b-0 even:bg-surface-muted/40">
                <td className="px-4 py-3 font-medium text-foreground">{row.size}</td>
                {orderedKeys.map((key) => (
                  <td key={key} className="px-4 py-3 text-foreground/70">
                    {row.measurements[key] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sizeNote ? <p className="text-xs text-foreground/50">{sizeNote}</p> : null}
    </section>
  );
}
