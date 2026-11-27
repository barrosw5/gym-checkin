import { ChartColumn } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import Card from "./ui/Card";
import { ICON } from "./ui/icon";

/** Every home page: the way to the statistics. */
export default function StatsLink() {
  const { t } = useTranslation();

  return (
    <Card>
      <Link to="/stats" className="group flex min-h-11 items-center gap-3 rounded-lg">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-ink">
          <ChartColumn {...ICON} />
        </span>
        <span className="flex-1">
          <span className="block font-medium text-accent-ink group-hover:text-ink">{t("stats.link")}</span>
          <span className="block text-sm text-ink-3">{t("stats.linkHint")}</span>
        </span>
      </Link>
    </Card>
  );
}
