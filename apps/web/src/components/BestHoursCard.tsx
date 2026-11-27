import type { BestHour } from "../core/types/stats";
import { formatNumber } from "../core/utils/format";
import { useTranslation } from "../hooks/useTranslation";
import Card from "./ui/Card";

/** The quietest hours still ahead today, from this weekday's history. */
export default function BestHoursCard({ best }: { best: BestHour[] }) {
  const { t, languageTag } = useTranslation();

  return (
    <Card title={t("stats.best.title")}>
      {best.length > 0 ? (
        <>
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            {best.map((b) => (
              <li key={b.hour}>
                <p className="text-3xl font-medium text-accent-ink tabular-nums">{t("stats.best.hour", { hour: b.hour })}</p>
                <p className="text-sm text-ink-3">{t("stats.best.people", { value: formatNumber(b.average, languageTag) })}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-2">{t("stats.best.hint")}</p>
        </>
      ) : (
        <p className="text-sm text-ink-3">{t("stats.best.none")}</p>
      )}
    </Card>
  );
}
