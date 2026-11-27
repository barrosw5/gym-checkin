import { useId, type ReactNode } from "react";
import { cn } from "../../core/utils/cn";

export interface CardProps {
  /** Section heading; also labels the section for screen readers. */
  title?: ReactNode;
  /** Quiet text or an action on the right of the heading (e.g. a count). */
  meta?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** One topic per card: white surface, hairline, small neutral shadow. */
export default function Card({ title, meta, className, children }: CardProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn(
        "rounded-2xl bg-surface p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] ring-1 ring-line sm:p-6",
        className,
      )}
    >
      {(title || meta) && (
        <div className="mb-4 flex items-baseline justify-between gap-4">
          {title && (
            <h2 id={titleId} className="text-base font-medium text-ink">
              {title}
            </h2>
          )}
          {meta && <div className="text-sm text-ink-3 tabular-nums">{meta}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
