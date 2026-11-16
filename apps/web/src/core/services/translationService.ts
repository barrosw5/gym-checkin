import { en } from "../i18n/locales/en";
import { pt } from "../i18n/locales/pt";
import {
  LOCALES,
  type Locale,
  type MessageKey,
  type MessageParams,
  type Messages,
} from "../i18n/types";

const MESSAGES: Record<Locale, Messages> = { pt, en };
// localStorage holds only this UI preference, never tokens (CLAUDE.md)
const STORAGE_KEY = "locale";
const DEFAULT_LOCALE: Locale = "pt";

/** BCP 47 tag for <html lang> and Intl (dates, numbers). */
export const LANGUAGE_TAG: Record<Locale, string> = { pt: "pt-PT", en: "en-GB" };

const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

export const translationService = {
  /** Saved choice, else the browser's language, else Portuguese. */
  getInitialLocale: (): Locale => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (isLocale(saved)) return saved;
    } catch {
      // Storage blocked (private mode): fall through to the browser language
    }
    const browser = navigator.language.slice(0, 2).toLowerCase();
    return isLocale(browser) ? browser : DEFAULT_LOCALE;
  },

  saveLocale: (locale: Locale): void => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Not saved: the choice still applies until the page is reloaded
    }
  },

  /**
   * The message for a key, with {placeholders} filled in. Unknown
   * placeholders are left visible, so a typo shows up instead of vanishing.
   */
  translate: (locale: Locale, key: MessageKey, params?: MessageParams): string => {
    const text = key
      .split(".")
      .reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], MESSAGES[locale]);
    if (typeof text !== "string") return key;
    return params
      ? text.replace(/\{(\w+)\}/g, (match, name: string) =>
          name in params ? String(params[name]) : match,
        )
      : text;
  },
};
