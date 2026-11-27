/**
 * The hours worth showing in the heatmap: from the first to the last hour
 * with anyone inside on any weekday. No activity at all: the whole day.
 */
export function activeHours(heatmap: (number | null)[][]): number[] {
  const all = Array.from({ length: 24 }, (_, hour) => hour);
  const busy = all.filter((hour) => heatmap.some((day) => (day[hour] ?? 0) > 0));
  return busy.length ? all.slice(busy[0], busy[busy.length - 1] + 1) : all;
}
