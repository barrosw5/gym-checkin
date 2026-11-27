import type { MessageKey, MessageParams } from "../i18n/types";
import type { Stats } from "../types/stats";
import { formatMinute, formatNumber } from "./format";

/**
 * The gist of the occupancy chart in one sentence: today's peak, or the
 * typical day's busiest hour when there is a longer period to compare with.
 */
export function chartSummary(
  stats: Stats,
  t: (key: MessageKey, params?: MessageParams) => string,
  languageTag: string,
): string {
  if (stats.range !== "today" && stats.peakTypical) {
    const { hour, average } = stats.peakTypical;
    return t("stats.chart.summaryTypical", { hour, value: formatNumber(average, languageTag) });
  }
  return stats.peakToday
    ? t("stats.chart.summaryToday", { max: stats.peakToday.count, at: formatMinute(stats.peakToday.minute) })
    : t("stats.chart.empty");
}
