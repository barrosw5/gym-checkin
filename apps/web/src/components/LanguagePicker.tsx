import { LOCALES } from "../core/i18n/types";
import { cn } from "../core/utils/cn";
import { useTranslation } from "../hooks/useTranslation";

export interface LanguagePickerProps {
  /** onDark: inside the navy brand bar; onLight: on a white/grey page. */
  tone?: "onDark" | "onLight";
}

/** PT | EN switch. The choice is remembered on this device. */
export default function LanguagePicker({ tone = "onLight" }: LanguagePickerProps) {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className={cn(
        "inline-flex rounded-full p-1 text-sm font-semibold",
        tone === "onDark" ? "bg-navy-900/60" : "bg-slate-200",
      )}
    >
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            // Announces which language is active
            aria-pressed={active}
            // The full name for screen readers; the short code on screen
            aria-label={t(`language.${option}`)}
            lang={option}
            className={cn(
              // 44 px wide touch target, compact height inside the bar
              "min-h-9 min-w-11 rounded-full px-3 transition-colors",
              active
                ? "bg-gold-400 text-navy-900"
                : tone === "onDark"
                  ? "text-navy-100 hover:text-white"
                  : "text-slate-700 hover:text-navy-900",
            )}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
