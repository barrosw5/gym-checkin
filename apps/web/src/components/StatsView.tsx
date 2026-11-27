import { STATS_RANGES, type StatsRange } from "@gym-checkin/shared";
import type { Stats } from "../core/types/stats";
import { chartSummary } from "../core/utils/chartSummary";
import { cn } from "../core/utils/cn";
import { useTranslation } from "../hooks/useTranslation";
import BestHoursCard from "./BestHoursCard";
import OccupancyChart from "./OccupancyChart";
import StatsHeatmap from "./StatsHeatmap";
import Button from "./ui/Button";
import Card from "./ui/Card";
import SegmentedControl from "./ui/SegmentedControl";

export interface StatsViewProps {
  range: StatsRange;
  onRangeChange: (range: StatsRange) => void;
  /** Last loaded numbers (kept on screen while another period loads). */
  stats: Stats | null;
  loading: boolean;
  failed: boolean;
  onReload: () => void;
}

/** The statistics page: one period filter for everything below it. */
export default function StatsView({ range, onRangeChange, stats, loading, failed, onReload }: StatsViewProps) {
  const { t, languageTag } = useTranslation();
  const isToday = range === "today";

  return (
    <div className="flex flex-col gap-4">
      <SegmentedControl
        label={t("stats.range.label")}
        options={STATS_RANGES.map((value) => ({ value, label: t(`stats.range.${value}`) }))}
        value={range}
        onChange={onRangeChange}
        className="self-start"
      />

      {failed && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-ink-2">{t("common.loadFailed")}</p>
          <Button size="sm" variant="secondary" onClick={onReload}>
            {t("common.retry")}
          </Button>
        </div>
      )}
      {!stats && !failed && <p className="text-sm text-ink-3">{t("common.loading")}</p>}

      {stats && (
        // The previous period stays visible, dimmed, while the new one loads
        <div
          aria-busy={loading}
          className={cn("flex flex-col gap-4 transition-opacity duration-150", loading && "opacity-60")}
        >
          <Card title={t("stats.chart.title")}>
            {stats.hasVisits ? (
              <OccupancyChart rows={stats.chart} showTypical={!isToday} summary={chartSummary(stats, t, languageTag)} />
            ) : (
              <p className="text-sm text-ink-3">{t("stats.chart.empty")}</p>
            )}
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {!isToday && <BestHoursCard best={stats.best} />}

            <Card title={t("stats.duration.title")}>
              {stats.duration.visits > 0 && stats.duration.averageMinutes !== null && stats.duration.medianMinutes !== null ? (
                <>
                  <dl className="flex flex-wrap gap-x-8 gap-y-2">
                    <div>
                      <dt className="text-sm text-ink-3">{t("stats.duration.average")}</dt>
                      <dd className="text-2xl font-medium text-ink tabular-nums">
                        {t("stats.duration.minutes", { value: stats.duration.averageMinutes })}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-ink-3">{t("stats.duration.median")}</dt>
                      <dd className="text-2xl font-medium text-ink tabular-nums">
                        {t("stats.duration.minutes", { value: stats.duration.medianMinutes })}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-sm text-ink-2 tabular-nums">
                    {t("stats.duration.visits", { value: stats.duration.visits })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-ink-3">{t("stats.duration.none")}</p>
              )}
            </Card>
          </div>

          {/* One day fills one row only: the heatmap needs a longer period */}
          {!isToday && stats.hasVisits && (
            <Card title={t("stats.heatmap.title")}>
              <p className="mb-3 text-sm text-ink-2">{t("stats.heatmap.hint")}</p>
              <StatsHeatmap heatmap={stats.heatmap} todayWeekday={stats.todayWeekday} />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
