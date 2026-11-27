import { useStats } from "../hooks/useStats";
import StatsView from "./StatsView";

/** Statistics page (any role): connects the hook to the view. */
export default function Stats() {
  const { range, setRange, stats, loading, failed, reload } = useStats();

  return (
    <StatsView
      range={range}
      onRangeChange={setRange}
      stats={stats}
      loading={loading}
      failed={failed}
      onReload={reload}
    />
  );
}
