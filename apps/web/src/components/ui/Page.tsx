import type { ReactNode } from "react";
import { cn } from "../../core/utils/cn";
import { useTranslation } from "../../hooks/useTranslation";

export interface PageProps {
  /** Page heading (h1) and browser tab title: names the context, never a greeting. */
  title?: string;
  /** One quiet line or row under the title (e.g. the user and their member number). */
  subtitle?: ReactNode;
  /**
   * narrow: one column (forms, account). medium: two columns on a PC
   * (member home). wide: desks and statistics, using the whole width.
   */
  width?: "narrow" | "medium" | "wide";
  children: ReactNode;
}

const WIDTHS = { narrow: "max-w-md", medium: "max-w-4xl", wide: "max-w-6xl" };

/** The content of a page: title and what comes under it, without any chrome. */
export default function Page({ title, subtitle, width = "narrow", children }: PageProps) {
  const { t } = useTranslation();

  return (
    <main className={cn("mx-auto flex w-full flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8", WIDTHS[width])}>
      {/* React 19 moves <title> into <head>. A title per page is how screen
          reader users know where they are (WCAG 2.4.2); one fixed title for
          every route would not tell them that the page changed */}
      <title>{title ? t("layout.documentTitle", { page: title }) : t("layout.documentTitleHome")}</title>
      {(title || subtitle) && (
        <div className="mb-2 flex flex-col gap-2">
          {title && <h1 className="text-[28px] leading-tight font-medium text-ink">{title}</h1>}
          {subtitle && <div className="flex flex-wrap items-center gap-2 text-ink-2">{subtitle}</div>}
        </div>
      )}
      {children}
    </main>
  );
}
