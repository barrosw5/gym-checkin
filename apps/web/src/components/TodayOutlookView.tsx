import type { Stats } from "../core/types/stats";
import { chartSummary } from "../core/utils/chartSummary";
import { useTranslation } from "../hooks/useTranslation";
import BestHoursCard from "./BestHoursCard";
import OccupancyChart from "./OccupancyChart";
import Button from "./ui/Button";
import Card from "./ui/Card";

export interface TodayOutlookViewProps {
  /** null while the first numbers load. */
  stats: Stats | null;
  /** The last request failed (older numbers, if any, stay on screen). */
  failed: boolean;
  onReload: () => void;
}

/** "Should I go now or later": today's curve and the quietest hours ahead. */
export default function TodayOutlookView({ stats, failed, onReload }: TodayOutlookViewProps) {
  const { t, languageTag } = useTranslation();

  if (!stats) {
    return (
      <Card title={t("stats.chart.title")}>
        {failed ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-ink-2">{t("common.loadFailed")}</p>
            <Button size="sm" variant="secondary" onClick={onReload}>
              {t("common.retry")}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-ink-3">{t("common.loading")}</p>
        )}
      </Card>
    );
  }

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[2fr_1fr]">
      <Card title={t("stats.chart.title")}>
        {stats.hasVisits ? (
          <OccupancyChart rows={stats.chart} showTypical summary={chartSummary(stats, t, languageTag)} />
        ) : (
          <p className="text-sm text-ink-3">{t("stats.chart.empty")}</p>
        )}
      </Card>
      <BestHoursCard best={stats.best} />
    </div>
  );
}
