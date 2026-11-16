import type { OccupancyView } from "../core/types/occupancy";
import { cn } from "../core/utils/cn";
import { useTranslation } from "../hooks/useTranslation";
import Card from "./ui/Card";

export interface OccupancyCounterViewProps {
  /** null while the first value is loading. */
  occupancy: OccupancyView | null;
  /** The live connection dropped: the value shown may be outdated. */
  stale: boolean;
}

/** "3/10 people in the gym now", with a bar that turns red when full. */
export default function OccupancyCounterView({ occupancy, stale }: OccupancyCounterViewProps) {
  const { t } = useTranslation();

  if (!occupancy) {
    return (
      <Card>
        <p className="text-slate-600">{t("occupancy.loading")}</p>
      </Card>
    );
  }

  const { count, capacity, isFull } = occupancy;
  const percent = Math.min(100, Math.round((count / capacity) * 100));

  return (
    <Card>
      {/* aria-live: screen readers announce the new count when it changes */}
      <div aria-live="polite">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {t("occupancy.label")}
        </p>
        <p className={cn("mt-1 text-5xl font-black", isFull ? "text-red-700" : "text-navy-900")}>
          {count}
          <span className="text-2xl font-bold text-slate-500">/{capacity}</span>
        </p>
        {/* Decorative: the numbers above already say it */}
        <div aria-hidden="true" className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className={cn("h-full rounded-full transition-all", isFull ? "bg-red-700" : "bg-gold-400")}
            style={{ width: `${percent}%` }}
          />
        </div>
        {isFull && <p className="mt-2 font-semibold text-red-700">{t("occupancy.full")}</p>}
      </div>
      {stale && <p className="mt-2 text-sm text-slate-600">{t("common.reconnecting")}</p>}
    </Card>
  );
}
