import { WifiOff } from "lucide-react";
import type { OccupancyView } from "../core/types/occupancy";
import { cn } from "../core/utils/cn";
import { useTranslation } from "../hooks/useTranslation";
import Card from "./ui/Card";
import { ICON } from "./ui/icon";

export interface OccupancyCounterViewProps {
  /** null while the first value is loading. */
  occupancy: OccupancyView | null;
  /** The live connection dropped: the value shown may be outdated. */
  stale: boolean;
  /** Bigger figure and blocks, where the occupancy is the main thing on screen. */
  large?: boolean;
}

/** Up to this capacity every place is drawn; above it, a single bar. */
const MAX_DRAWN_PLACES = 24;

/**
 * The screen's moment: one block per place in the gym, like the hooks on
 * the reception key board. Taken places are lime; all turn orange when full.
 */
export default function OccupancyCounterView({ occupancy, stale, large = false }: OccupancyCounterViewProps) {
  const { t } = useTranslation();

  if (!occupancy) {
    return (
      <Card>
        <p className="text-sm text-ink-3">{t("occupancy.loading")}</p>
      </Card>
    );
  }

  const { count, capacity, isFull } = occupancy;
  const taken = isFull ? "bg-warn-solid" : "bg-data";

  return (
    <Card>
      {/* aria-live: screen readers announce the new count when it changes */}
      <div aria-live="polite">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-ink-2">{t("occupancy.label")}</p>
          {isFull && <p className="text-sm font-medium text-warn">{t("occupancy.full")}</p>}
        </div>
        <p className={cn("mt-1 font-medium tracking-tight text-ink tabular-nums", large ? "text-6xl lg:text-8xl" : "text-5xl")}>
          {count}
          <span className={cn("text-ink-3", large ? "text-3xl lg:text-4xl" : "text-2xl")}>/{capacity}</span>
        </p>

        {capacity <= MAX_DRAWN_PLACES ? (
          <div
            role="img"
            aria-label={t("occupancy.places", { count, capacity })}
            className="mt-4 flex gap-1"
          >
            {Array.from({ length: capacity }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "flex-1 rounded-md transition-colors duration-300 ease-(--ease-out)",
                  large ? "h-10 lg:h-16" : "h-8",
                  i < count ? taken : "bg-raised ring-1 ring-inset ring-line",
                )}
              />
            ))}
          </div>
        ) : (
          <div
            role="img"
            aria-label={t("occupancy.places", { count, capacity })}
            className="mt-4 h-3 overflow-hidden rounded-full bg-raised"
          >
            {/* scaleX instead of width: animates on the GPU, never re-lays out */}
            <div
              className={cn("h-full origin-left rounded-full transition-transform duration-300 ease-(--ease-out)", taken)}
              style={{ transform: `scaleX(${Math.min(1, count / capacity)})` }}
            />
          </div>
        )}
      </div>

      {stale && (
        <p className="mt-3 flex items-center gap-2 text-sm text-ink-3">
          <WifiOff {...ICON} />
          {t("common.reconnecting")}
        </p>
      )}
    </Card>
  );
}
