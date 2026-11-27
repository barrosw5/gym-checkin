import { LOCALES } from "../core/i18n/types";
import { cn } from "../core/utils/cn";
import { useTranslation } from "../hooks/useTranslation";

/** PT | EN switch. The choice is remembered on this device. */
export default function LanguagePicker() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div role="group" aria-label={t("language.label")} className="inline-flex rounded-lg bg-raised p-0.5 text-sm">
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
              // Looks 32 px (fits the header); the invisible ::before makes the tap area 44 px
              "relative h-8 min-w-11 rounded-md px-2.5 transition-colors duration-150 before:absolute before:inset-x-0 before:-inset-y-1.5",
              active
                ? "bg-selected font-medium text-ink shadow-[0_1px_2px_rgba(15,23,42,0.08)]"
                : "text-ink-2 hover:text-ink",
            )}
          >
            {option.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
