import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LocaleContext } from "../core/i18n/context";
import type { Locale } from "../core/i18n/types";
import { LANGUAGE_TAG, translationService } from "../core/services/translationService";

/** Holds the chosen language for the whole app (wraps <App /> in main.tsx). */
export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(translationService.getInitialLocale);

  // <html lang>: screen readers and the browser use it to pronounce and translate
  useEffect(() => {
    document.documentElement.lang = LANGUAGE_TAG[locale];
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: (next: Locale) => {
        translationService.saveLocale(next);
        setLocaleState(next);
      },
    }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
