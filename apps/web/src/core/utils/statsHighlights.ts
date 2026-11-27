import type { Translatable } from "../i18n/types";
import type { Stats } from "../types/stats";
import { formatMinute, formatNumber } from "./format";

/** One figure of the band on top of the statistics. */
export interface Highlight {
  label: Translatable;
  /** Ready to show, or a message (e.g. "19h"); null: no data for it. */
  value: string | Translatable | null;
  hint: Translatable | null;
}

/**
 * The four figures that answer the page at a glance. A period compares with
 * the typical day (busiest hour, calmest hour ahead); "today" has no history
 * to compare with, so it shows today's own peak.
 */
export function statsHighlights(stats: Stats, languageTag: string): Highlight[] {
  const n = (value: number) => formatNumber(value, languageTag);
  const { visits, averageMinutes, medianMinutes } = stats.duration;

  const counts: Highlight[] = [
    { label: { key: "stats.highlights.visits" }, value: n(visits), hint: { key: "stats.highlights.visitsHint" } },
    {
      label: { key: "stats.highlights.duration" },
      value: averageMinutes === null ? null : { key: "stats.duration.minutes", params: { value: averageMinutes } },
      hint:
        medianMinutes === null ? null : { key: "stats.highlights.median", params: { value: medianMinutes } },
    },
  ];

  if (stats.range === "today") {
    const peak = stats.peakToday;
    return [
      ...counts,
      { label: { key: "stats.highlights.peakTime" }, value: peak ? formatMinute(peak.minute) : null, hint: null },
      { label: { key: "stats.highlights.peakPeople" }, value: peak ? n(peak.count) : null, hint: null },
    ];
  }

  const busiest = stats.peakTypical;
  const calmest = stats.best.reduce<Stats["best"][number] | null>(
    (best, hour) => (!best || hour.average < best.average ? hour : best),
    null,
  );
  const hourOf = (h: { hour: number } | null): Highlight["value"] =>
    h ? { key: "stats.best.hour", params: { hour: h.hour } } : null;
  const peopleOf = (h: { average: number } | null): Translatable | null =>
    h ? { key: "stats.best.people", params: { value: n(h.average) } } : null;

  return [
    ...counts,
    { label: { key: "stats.highlights.busiest" }, value: hourOf(busiest), hint: peopleOf(busiest) },
    { label: { key: "stats.highlights.calmest" }, value: hourOf(calmest), hint: peopleOf(calmest) },
  ];
}
