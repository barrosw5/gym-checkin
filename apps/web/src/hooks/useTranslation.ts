import { useCallback, useContext } from "react";
import { LocaleContext } from "../core/i18n/context";
import type { MessageKey, MessageParams, Translatable } from "../core/i18n/types";
import { LANGUAGE_TAG, translationService } from "../core/services/translationService";

/**
 * Text in the language the user picked. Components never hold fixed
 * sentences: they call t("some.key") and the locale files hold the text.
 */
export const useTranslation = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useTranslation must be used inside <LocaleProvider>");
  const { locale, setLocale } = context;

  const t = useCallback(
    (key: MessageKey, params?: MessageParams) =>
      translationService.translate(locale, key, params),
    [locale],
  );

  /** Messages that come from hooks/services (errors, results) as keys. */
  const tm = useCallback(
    (message: Translatable) => translationService.translate(locale, message.key, message.params),
    [locale],
  );

  return { t, tm, locale, setLocale, languageTag: LANGUAGE_TAG[locale] };
};
