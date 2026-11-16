import { createContext } from "react";
import type { Locale } from "./types";

export interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

/** Filled by LocaleProvider (main.tsx); read through useTranslation(). */
export const LocaleContext = createContext<LocaleContextValue | null>(null);
