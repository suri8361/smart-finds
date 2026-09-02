const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a plain number as USD, e.g. 19.99 -> "$19.99". Shared by ProductCard and the product detail page. */
export function formatPrice(amount: number): string {
  return currencyFormatter.format(amount);
}
