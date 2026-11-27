import { useStats } from "../hooks/useStats";
import { useTranslation } from "../hooks/useTranslation";
import StatsView from "./StatsView";
import Page from "./ui/Page";

/** Statistics page (any role): connects the hook to the view. */
export default function Stats() {
  const { range, setRange, stats, loading, failed, reload } = useStats();
  const { t } = useTranslation();

  return (
    <Page width="wide" title={t("stats.title")}>
      <StatsView
        range={range}
        onRangeChange={setRange}
        stats={stats}
        loading={loading}
        failed={failed}
        onReload={reload}
      />
    </Page>
  );
}
