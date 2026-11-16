import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartRow } from "../core/types/stats";
import { formatMinute, formatNumber } from "../core/utils/format";
import { useTranslation } from "../hooks/useTranslation";

export interface OccupancyChartProps {
  rows: ChartRow[];
  /** Also draw the typical day of the period behind today (any range but "today"). */
  showTypical: boolean;
  /** One sentence with the gist, read instead of the drawing by screen readers. */
  summary: string;
}

// Every 3 hours: readable on a phone, enough to place a time on a PC
const TICKS = [0, 180, 360, 540, 720, 900, 1080, 1260, 1440];

/** Occupancy through the day: today (exact steps) over the typical day (average). */
export default function OccupancyChart({ rows, showTypical, summary }: OccupancyChartProps) {
  const { t, languageTag } = useTranslation();

  return (
    <figure>
      {/* The SVG is decoration for screen readers: the sentence carries the data */}
      <div aria-hidden="true" className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke="var(--color-slate-200)" />
            <XAxis
              dataKey="minute"
              type="number"
              domain={[0, 1440]}
              ticks={TICKS}
              tickFormatter={formatMinute}
              tick={{ fontSize: 12, fill: "var(--color-slate-500)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-slate-300)" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "var(--color-slate-500)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={(minute) => formatMinute(Number(minute))}
              formatter={(value, name) => [
                t("stats.chart.people", { value: formatNumber(Number(value), languageTag) }),
                name,
              ]}
              contentStyle={{ borderRadius: 8, borderColor: "var(--color-slate-200)", fontSize: 13 }}
            />
            {showTypical && (
              <Area
                dataKey="typical"
                name={t("stats.chart.typical")}
                type="monotone"
                stroke="var(--color-navy-300)"
                fill="var(--color-navy-100)"
                fillOpacity={0.6}
                isAnimationActive={false}
              />
            )}
            {showTypical ? (
              <Line
                dataKey="today"
                name={t("stats.chart.today")}
                type="stepAfter"
                stroke="var(--color-navy-700)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ) : (
              <Area
                dataKey="today"
                name={t("stats.chart.today")}
                type="stepAfter"
                stroke="var(--color-navy-700)"
                fill="var(--color-navy-100)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
        {showTypical && (
          // The legend: both lines named, with the same colours as drawn
          <span className="flex flex-wrap gap-x-4 gap-y-1" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-navy-700" />
              {t("stats.chart.today")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-4 rounded-sm bg-navy-100 ring-1 ring-navy-300" />
              {t("stats.chart.typical")}
            </span>
          </span>
        )}
        <span>{summary}</span>
      </figcaption>
    </figure>
  );
}
