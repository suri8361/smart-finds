type ClassValue = string | number | null | false | undefined;

/** Joins conditional class names, dropping falsy values. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
