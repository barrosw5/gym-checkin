import type { ReactNode } from "react";
import { cn } from "../../core/utils/cn";
import { useTranslation } from "../../hooks/useTranslation";
import LanguagePicker from "../LanguagePicker";

export interface PageLayoutProps {
  /** Page heading (h1) and browser tab title: names the context, never a greeting. */
  title?: string;
  /** One quiet line or row under the title (e.g. the user and their room). */
  subtitle?: ReactNode;
  /**
   * narrow: one column, phone first (student pages, forms).
   * wide: reception/admin desks on a PC, using the whole width.
   */
  width?: "narrow" | "wide";
  children: ReactNode;
}

const WIDTHS = { narrow: "max-w-md", wide: "max-w-6xl" };

/** Every page: a quiet white bar with the name, then the content. */
export default function PageLayout({ title, subtitle, width = "narrow", children }: PageLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-svh">
      {/* React 19 moves <title> into <head>. A title per page is how screen
          reader users know where they are (WCAG 2.4.2); one fixed title for
          every route would not tell them that the page changed */}
      <title>{title ? t("layout.documentTitle", { page: title }) : t("layout.documentTitleHome")}</title>
      <header className="border-b border-slate-900/[0.08] bg-white">
        <div className={cn("mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:px-6", WIDTHS[width])}>
          <div className="flex items-center gap-2.5">
            {/* Flat roundel in the crest navy: the brand mark (no logo file, by decision) */}
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-full bg-navy-700 text-[11px] font-semibold text-white"
            >
              XII
            </span>
            <span className="text-[15px] font-semibold text-navy-900">
              Pio XII
              <span className="font-normal text-slate-500"> · {t("layout.appName")}</span>
            </span>
          </div>
          <LanguagePicker />
        </div>
      </header>

      <main className={cn("mx-auto flex flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8", WIDTHS[width])}>
        {(title || subtitle) && (
          <div className="mb-2 flex flex-col gap-2">
            {title && <h1 className="text-[28px] leading-tight font-medium text-slate-900">{title}</h1>}
            {subtitle && <div className="flex flex-wrap items-center gap-2 text-slate-600">{subtitle}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
