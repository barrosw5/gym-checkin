import { activeHours } from "../core/utils/activeHours";
import { cn } from "../core/utils/cn";
import { formatNumber, formatWeekday } from "../core/utils/format";
import { useTranslation } from "../hooks/useTranslation";

export interface StatsHeatmapProps {
  /** 7 weekdays (Monday first) × 24 hours, average people; null = no data. */
  heatmap: (number | null)[][];
  /** Today's row (0 = Monday), marked so it is easy to find. */
  todayWeekday: number;
}

/**
 * Weekday × hour, stronger colour = busier. A real <table>: screen readers
 * walk it by row and column, and each cell says its number (visually hidden).
 * Two shapes of the same data, one visible at a time (the other is
 * display:none, so it is not read): days as rows on wide screens; rotated on
 * phones, where 7 columns fit and 17 hours would need sideways scrolling.
 */
export default function StatsHeatmap({ heatmap, todayWeekday }: StatsHeatmapProps) {
  const { t, languageTag } = useTranslation();
  const hours = activeHours(heatmap);
  const days = heatmap.map((_, day) => formatWeekday(day, languageTag));
  // Scale to the busiest cell of this period, so a quiet month still shows its pattern
  const max = Math.max(0, ...heatmap.flat().map((v) => v ?? 0));

  const cell = (day: number, hour: number) => {
    const value = heatmap[day][hour];
    return (
      <td
        key={`${day}-${hour}`}
        // relative: keeps the sr-only text (position:absolute) inside the cell
        className={cn("relative h-6 rounded-sm sm:h-7", value === null ? "bg-canvas" : "bg-raised")}
        // The one dynamic value: how strong the colour of this cell is
        style={value && max > 0 ? { backgroundColor: `color-mix(in oklab, var(--data) ${Math.round((value / max) * 100)}%, var(--data-soft))` } : undefined}
      >
        <span className="sr-only">
          {t("stats.heatmap.cell", {
            day: days[day],
            hour,
            value: value === null ? t("stats.heatmap.noData") : formatNumber(value, languageTag),
          })}
        </span>
      </td>
    );
  };
  const today = (day: number) => (day === todayWeekday ? "font-medium text-accent-ink" : "text-ink-2");

  return (
    <>
      {/* Wide screens: one row per day */}
      <table className="hidden w-full table-fixed border-separate border-spacing-0.5 text-xs sm:table">
        <thead>
          <tr>
            <th className="w-16" />
            {hours.map((hour) => (
              <th key={hour} scope="col" className="pb-1 font-normal text-ink-3 tabular-nums">
                {/* Every 3 hours on screen; every header still has its hour for screen readers */}
                <span className={cn(hour % 3 !== 0 && "sr-only")}>{hour}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((name, day) => (
            <tr key={day}>
              <th scope="row" className={cn("pr-1.5 text-left font-normal capitalize", today(day))}>
                {name}
              </th>
              {hours.map((hour) => cell(day, hour))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phones: one row per hour */}
      <table className="w-full table-fixed border-separate border-spacing-0.5 text-xs sm:hidden">
        <thead>
          <tr>
            <th className="w-9" />
            {days.map((name, day) => (
              <th key={day} scope="col" className={cn("pb-1 font-normal capitalize", today(day))}>
                {/* Three letters fit a phone column; the full name is read out */}
                <span aria-hidden="true">{name.slice(0, 3)}</span>
                <span className="sr-only">{name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour}>
              <th scope="row" className="pr-1 text-right font-normal text-ink-3 tabular-nums">
                {t("stats.best.hour", { hour })}
              </th>
              {days.map((_, day) => cell(day, hour))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
