import { Check, X } from "lucide-react";

export interface ProsConsListProps {
  pros: string[];
  cons: string[];
}

/** Pros/cons pair — copy is authored strictly from the product's existing summary/evidence text (see lib/data/products.ts). */
export function ProsConsList({ pros, cons }: ProsConsListProps) {
  return (
    <div className="grid gap-8 sm:grid-cols-2">
      <div>
        <h3 className="font-display text-h3 font-semibold text-foreground">Pros</h3>
        <ul className="mt-4 flex flex-col gap-3">
          {pros.map((pro) => (
            <li key={pro} className="flex items-start gap-2 text-sm text-foreground/70">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage-600" aria-hidden="true" />
              {pro}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-display text-h3 font-semibold text-foreground">Cons</h3>
        <ul className="mt-4 flex flex-col gap-3">
          {cons.map((con) => (
            <li key={con} className="flex items-start gap-2 text-sm text-foreground/70">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-foreground/40" aria-hidden="true" />
              {con}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
