import type { ReactNode } from "react";
import { cn } from "../../core/utils/cn";

export type AlertTone = "error" | "warning" | "info" | "success";

export interface AlertProps {
  tone?: AlertTone;
  className?: string;
  children: ReactNode;
}

const TONES: Record<AlertTone, string> = {
  error: "border-red-700 bg-red-50 text-red-800",
  warning: "border-ember-700 bg-ember-100 text-ember-700",
  info: "border-sky-800 bg-sky-50 text-sky-800",
  success: "border-green-700 bg-green-50 text-green-800",
};

/**
 * A message box. Errors use role="alert" (read out immediately); the rest
 * use role="status" (read out politely, without interrupting).
 */
export default function Alert({ tone = "info", className, children }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-xl border-l-4 px-4 py-3 text-sm font-medium", TONES[tone], className)}
    >
      {children}
    </div>
  );
}
