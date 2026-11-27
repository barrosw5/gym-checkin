import { cn } from "../../core/utils/cn";
import { useTranslation } from "../../hooks/useTranslation";

export interface MemberBibProps {
  room: string;
  className?: string;
}

/** A pin hole of the bib. */
const PIN = "absolute top-1 size-0.75 rounded-full bg-bib-ink/50";

/**
 * The signature detail: a member number as a race bib, with the two pin
 * holes at the top. Used for member numbers only, everywhere they appear,
 * and nowhere else.
 */
export default function MemberBib({ room, className }: MemberBibProps) {
  const { t } = useTranslation();

  return (
    <span
      // role="img" gives the label a role that can be named: screen readers
      // hear "Sócio n.º 501", not just "501"
      role="img"
      aria-label={t("common.room", { room })}
      className={cn(
        "relative inline-flex h-6 min-w-11 items-center justify-center rounded bg-bib px-2.5 pt-0.5",
        "text-[13px] leading-none font-semibold text-bib-ink tabular-nums",
        className,
      )}
    >
      <span aria-hidden="true" className={cn(PIN, "left-1")} />
      <span aria-hidden="true" className={cn(PIN, "right-1")} />
      {room}
    </span>
  );
}
