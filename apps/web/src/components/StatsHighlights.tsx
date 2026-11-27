import type { Stats } from "../core/types/stats";
import { statsHighlights } from "../core/utils/statsHighlights";
import { useTranslation } from "../hooks/useTranslation";
import Card from "./ui/Card";

/** The period in four figures: two per row on a phone, one row on a PC. */
export default function StatsHighlights({ stats }: { stats: Stats }) {
  const { tm, languageTag } = useTranslation();

  return (
    <Card>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4 lg:divide-x lg:divide-line">
        {statsHighlights(stats, languageTag).map(({ label, value, hint }) => (
          <div key={label.key} className="flex flex-col lg:pl-6 lg:first:pl-0">
            <dt className="text-sm text-ink-3">{tm(label)}</dt>
            <dd className="text-3xl font-medium tracking-tight text-ink tabular-nums lg:text-4xl">
              {value === null ? "–" : typeof value === "string" ? value : tm(value)}
            </dd>
            {hint && <dd className="text-sm text-ink-3 tabular-nums">{tm(hint)}</dd>}
          </div>
        ))}
      </dl>
    </Card>
  );
}
