/**
 * Joins class names, skipping falsy ones:
 * cn("btn", busy && "opacity-50") → "btn" or "btn opacity-50".
 * A few lines instead of the clsx dependency.
 */
export const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
