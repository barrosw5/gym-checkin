import type { pt } from "./locales/pt";

export const LOCALES = ["pt", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** The shape of every locale file: same keys as pt.ts, any string values. */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Messages = Widen<typeof pt>;

/** Every leaf of the messages tree as a dot path, e.g. "checkin.leave". */
type Paths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Paths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];
export type MessageKey = Paths<Messages>;

/** Values for the {placeholders} in a message. */
export type MessageParams = Record<string, string | number>;

/** A message to show, not yet translated (the component translates it). */
export interface Translatable {
  key: MessageKey;
  params?: MessageParams;
}

/**
 * Thrown by services instead of an Error with a fixed sentence: it carries a
 * message key, so the text follows the language the user picked.
 */
export class TranslatableError extends Error {
  readonly key: MessageKey;
  readonly params?: MessageParams;

  constructor(key: MessageKey, params?: MessageParams, options?: ErrorOptions) {
    super(key, options);
    this.name = "TranslatableError";
    this.key = key;
    this.params = params;
  }
}

/** Any caught error as something the UI can show (unknown → generic message). */
export const toTranslatable = (err: unknown): Translatable =>
  err instanceof TranslatableError
    ? { key: err.key, params: err.params }
    : { key: "errors.unexpected" };
