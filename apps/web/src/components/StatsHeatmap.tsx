import { cn } from "../core/utils/cn";
import { formatNumber, formatWeekday } from "../core/utils/format";
import { useTranslation } from "../hooks/useTranslation";

export interface StatsHeatmapProps {
  /** 7 weekdays (Monday first) × 24 hours, average people; null = no data. */
  heatmap: (number | null)[][];
  /** Today's row (0 = Monday), marked so it is easy to find. */
  todayWeekday: number;
}

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

/**
 * Weekday × hour, darker = busier. A real <table>: screen readers walk it
 * by row and column, and each cell says its number (visually hidden).
 */
export default function StatsHeatmap({ heatmap, todayWeekday }: StatsHeatmapProps) {
  const { t, languageTag } = useTranslation();
  // Scale to the busiest cell of this period, so a quiet month still shows its pattern
  const max = Math.max(0, ...heatmap.flat().map((v) => v ?? 0));

  return (
    // Scrolls sideways on narrow phones instead of squeezing 24 columns
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="w-full min-w-[520px] table-fixed border-separate border-spacing-0.5 text-xs">
        <thead>
          <tr>
            <th className="w-10" />
            {HOURS.map((hour) => (
              <th key={hour} scope="col" className="pb-1 font-normal text-slate-500 tabular-nums">
                {/* Every 3 hours on screen; every header still has its hour for screen readers */}
                <span className={cn(hour % 3 !== 0 && "sr-only")}>{hour}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {heatmap.map((row, day) => {
            const dayName = formatWeekday(day, languageTag);
            return (
              <tr key={day}>
                <th
                  scope="row"
                  className={cn(
                    "pr-1.5 text-left font-normal capitalize",
                    day === todayWeekday ? "font-medium text-navy-700" : "text-slate-600",
                  )}
                >
                  {dayName}
                </th>
                {row.map((value, hour) => (
                  <td
                    key={hour}
                    className={cn("h-6 rounded-sm", value === null ? "bg-slate-50" : "bg-slate-100")}
                    // The one dynamic value: how dark this cell is
                    style={value && max > 0 ? { backgroundColor: `color-mix(in oklab, var(--color-navy-700) ${Math.round((value / max) * 100)}%, var(--color-navy-50))` } : undefined}
                  >
                    <span className="sr-only">
                      {t("stats.heatmap.cell", {
                        day: dayName,
                        hour,
                        value: value === null ? t("stats.heatmap.noData") : formatNumber(value, languageTag),
                      })}
                    </span>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
