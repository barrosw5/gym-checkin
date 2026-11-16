import { LOCALES } from "../core/i18n/types";
import { cn } from "../core/utils/cn";
import { useTranslation } from "../hooks/useTranslation";

/** PT | EN switch. The choice is remembered on this device. */
export default function LanguagePicker() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div role="group" aria-label={t("language.label")} className="inline-flex rounded-lg bg-slate-100 p-0.5 text-sm">
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
              "h-8 min-w-10 rounded-md px-2.5 transition-colors duration-150",
              active
                ? "bg-white font-medium text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
