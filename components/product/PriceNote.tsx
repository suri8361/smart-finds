import { PRICE_DISCLAIMER } from "@/lib/config/site";
import { cn } from "@/lib/utils/cn";

/** Small, quiet "prices may change" line used near prices and under product grids. */
export function PriceNote({ className }: { className?: string }) {
  return <p className={cn("text-xs text-foreground/50", className)}>{PRICE_DISCLAIMER}</p>;
}
