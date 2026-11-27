import { STATS_RANGES, type StatsRange } from "@gym-checkin/shared";
import type { Stats } from "../core/types/stats";
import { chartSummary } from "../core/utils/chartSummary";
import { cn } from "../core/utils/cn";
import { useTranslation } from "../hooks/useTranslation";
import OccupancyChart from "./OccupancyChart";
import StatsHeatmap from "./StatsHeatmap";
import StatsHighlights from "./StatsHighlights";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Page from "./ui/Page";
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
    <Page
      width="wide"
      title={t("stats.title")}
      actions={
        <SegmentedControl
          label={t("stats.range.label")}
          options={STATS_RANGES.map((value) => ({ value, label: t(`stats.range.${value}`) }))}
          value={range}
          onChange={onRangeChange}
        />
      }
    >
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
          <StatsHighlights stats={stats} />

          <Card title={t("stats.chart.title")}>
            {stats.hasVisits ? (
              <OccupancyChart
                rows={stats.chart}
                showTypical={!isToday}
                summary={chartSummary(stats, t, languageTag)}
                tall
              />
            ) : (
              <p className="text-sm text-ink-3">{t("stats.chart.empty")}</p>
            )}
          </Card>

          {/* One day fills one row only: the heatmap needs a longer period */}
          {!isToday && stats.hasVisits && (
            <Card title={t("stats.heatmap.title")}>
              <p className="mb-3 text-sm text-ink-2">{t("stats.heatmap.hint")}</p>
              <StatsHeatmap heatmap={stats.heatmap} todayWeekday={stats.todayWeekday} />
            </Card>
          )}
        </div>
      )}
    </Page>
  );
}
