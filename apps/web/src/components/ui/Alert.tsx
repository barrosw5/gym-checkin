import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../core/utils/cn";
import { ICON } from "./icon";

export type AlertTone = "error" | "warning" | "info" | "success";

export interface AlertProps {
  tone?: AlertTone;
  /** Replaces the default icon (e.g. a spinner while waiting). */
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

const TONES: Record<AlertTone, { box: string; Icon: typeof Info }> = {
  error: { box: "bg-red-50 text-red-800", Icon: CircleAlert },
  warning: { box: "bg-ember-50 text-ember-700", Icon: TriangleAlert },
  info: { box: "bg-sky-50 text-sky-800", Icon: Info },
  success: { box: "bg-green-50 text-green-800", Icon: CircleCheck },
};

/**
 * A message. Errors use role="alert" (read out immediately); the rest use
 * role="status" (read out politely, without interrupting).
 */
export default function Alert({ tone = "info", icon, className, children }: AlertProps) {
  const { box, Icon } = TONES[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm", box, className)}
    >
      <span className="mt-px shrink-0">{icon ?? <Icon {...ICON} />}</span>
      <div>{children}</div>
    </div>
  );
}
