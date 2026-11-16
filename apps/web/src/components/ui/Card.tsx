import { useId, type ReactNode } from "react";
import { cn } from "../../core/utils/cn";

export interface CardProps {
  /** Section heading; also labels the section for screen readers. */
  title?: ReactNode;
  /** Right side of the heading row (e.g. a count or an action). */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** A white block on the grey page: one topic per card. */
export default function Card({ title, action, className, children }: CardProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={title ? titleId : undefined}
      className={cn("rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6", className)}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && (
            <h2 id={titleId} className="text-lg font-bold text-navy-900">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
