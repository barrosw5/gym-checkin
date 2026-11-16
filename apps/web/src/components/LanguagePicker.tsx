import { LOCALES } from "../core/i18n/types";
import { useTranslation } from "../hooks/useTranslation";

/** PT | EN switch. The choice is remembered on this device. */
export default function LanguagePicker() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div role="group" aria-label={t("language.label")} style={{ display: "flex", gap: "4px" }}>
      {LOCALES.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          // Announces which language is active
          aria-pressed={option === locale}
          // The full name for screen readers; the short code on screen
          aria-label={t(`language.${option}`)}
          lang={option}
          style={{ padding: "4px 8px", fontWeight: option === locale ? "bold" : "normal" }}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
