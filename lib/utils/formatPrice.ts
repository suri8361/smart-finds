/** Formats a price as a band with a "last checked" date, never a live/exact price (SRS §6). Shared by ProductCard and the product detail page. */
export function formatPriceBand(low: number, high: number, currency: string, lastCheckedAt: string): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });
  const asOf = new Date(lastCheckedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${formatter.format(low)}–${formatter.format(high)} · as of ${asOf}`;
}
