import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartRow } from "../core/types/stats";
import { chartAxis } from "../core/utils/chartAxis";
import { formatMinute, formatNumber } from "../core/utils/format";
import { useTranslation } from "../hooks/useTranslation";

export interface OccupancyChartProps {
  rows: ChartRow[];
  /** Also draw the typical day of the period behind today (any range but "today"). */
  showTypical: boolean;
  /** One sentence with the gist, read instead of the drawing by screen readers. */
  summary: string;
}

/** Occupancy through the day: today (exact steps) over the typical day (average). */
export default function OccupancyChart({ rows, showTypical, summary }: OccupancyChartProps) {
  const { t, languageTag } = useTranslation();
  const { domain, ticks } = chartAxis(rows);
  // Rows outside the axis would be drawn past its edges
  const visible = rows.filter((r) => r.minute >= domain[0] && r.minute <= domain[1]);

  return (
    <figure>
      {/* The SVG is decoration for screen readers: the sentence carries the data */}
      <div aria-hidden="true" className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={visible} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis
              dataKey="minute"
              type="number"
              domain={domain}
              ticks={ticks}
              tickFormatter={formatMinute}
              tick={{ fontSize: 12, fill: "var(--ink-3)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--line-strong)" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: "var(--ink-3)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              labelFormatter={(minute) => formatMinute(Number(minute))}
              formatter={(value, name) => [
                t("stats.chart.people", { value: formatNumber(Number(value), languageTag) }),
                name,
              ]}
              contentStyle={{
                borderRadius: 8,
                borderColor: "var(--line-strong)",
                background: "var(--surface)",
                fontSize: 13,
              }}
              labelStyle={{ color: "var(--ink)" }}
              itemStyle={{ color: "var(--ink-2)" }}
            />
            {showTypical && (
              <Area
                dataKey="typical"
                name={t("stats.chart.typical")}
                type="monotone"
                stroke="var(--line-strong)"
                fill="var(--raised)"
                fillOpacity={0.6}
                isAnimationActive={false}
              />
            )}
            {showTypical ? (
              <Line
                dataKey="today"
                name={t("stats.chart.today")}
                type="stepAfter"
                stroke="var(--data)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ) : (
              <Area
                dataKey="today"
                name={t("stats.chart.today")}
                type="stepAfter"
                stroke="var(--data)"
                fill="var(--data-soft)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-3 flex flex-col gap-2 text-sm text-ink-2">
        {showTypical && (
          // The legend: both lines named, with the same colours as drawn
          <span className="flex flex-wrap gap-x-4 gap-y-1" aria-hidden="true">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-data" />
              {t("stats.chart.today")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-4 rounded-sm bg-raised ring-1 ring-line-strong" />
              {t("stats.chart.typical")}
            </span>
          </span>
        )}
        <span>{summary}</span>
      </figcaption>
    </figure>
  );
}
