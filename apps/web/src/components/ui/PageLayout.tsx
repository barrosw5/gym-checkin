import type { ReactNode } from "react";
import { cn } from "../../core/utils/cn";
import { useTranslation } from "../../hooks/useTranslation";
import LanguagePicker from "../LanguagePicker";

export interface PageLayoutProps {
  /** Page heading (h1), under the brand bar. */
  title?: ReactNode;
  /** One line under the title (e.g. "Room 501"). */
  subtitle?: ReactNode;
  /**
   * narrow: one column, phone first (student pages, forms).
   * wide: reception/admin desks on a PC.
   */
  width?: "narrow" | "wide";
  children: ReactNode;
}

const WIDTHS = { narrow: "max-w-md", wide: "max-w-4xl" };

/** Every page: brand bar, title, then the content in a centred column. */
export default function PageLayout({ title, subtitle, width = "narrow", children }: PageLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-svh">
      <header className="bg-navy-700 text-white shadow-md">
        <div className={cn("mx-auto flex items-center justify-between gap-4 px-4 py-3", WIDTHS[width])}>
          <div className="flex items-center gap-3">
            {/* Text mark until the symbol is cleared for use (ROADMAP: ask the direction) */}
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-full border-2 border-gold-400 text-xs font-black text-gold-300"
            >
              XII
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-black tracking-widest text-gold-300">PIO XII</span>
              <span className="block text-xs text-navy-100">{t("layout.appName")}</span>
            </span>
          </div>
          <LanguagePicker tone="onDark" />
        </div>
      </header>

      <main className={cn("mx-auto flex flex-col gap-4 px-4 py-6", WIDTHS[width])}>
        {(title || subtitle) && (
          <div>
            {title && <h1 className="text-2xl font-bold text-navy-900 sm:text-3xl">{title}</h1>}
            {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
