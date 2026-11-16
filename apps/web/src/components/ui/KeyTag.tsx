import { cn } from "../../core/utils/cn";
import { useTranslation } from "../../hooks/useTranslation";

export interface KeyTagProps {
  room: string;
  className?: string;
}

/**
 * The signature detail: a room number as the brass tag on a key from the
 * reception key board (gold from the crest lettering). Used for room
 * numbers only, everywhere they appear, and nowhere else.
 */
export default function KeyTag({ room, className }: KeyTagProps) {
  const { t } = useTranslation();

  return (
    <span
      // Screen readers hear "Quarto 501", not just "501"
      aria-label={t("common.room", { room })}
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-md bg-gold-100 pr-2 pl-1.5 text-xs font-semibold text-gold-700 tabular-nums",
        "ring-1 ring-inset ring-gold-300/60",
        className,
      )}
    >
      {/* The hole the key ring goes through */}
      <span aria-hidden="true" className="size-1.5 rounded-full bg-white ring-1 ring-gold-300" />
      {room}
    </span>
  );
}
