import { useTodayOutlook } from "../hooks/useTodayOutlook";
import TodayOutlookView from "./TodayOutlookView";

/** Today at a glance: connects the hook (API) to the view. */
export default function TodayOutlook() {
  const { stats, failed, reload } = useTodayOutlook();
  return <TodayOutlookView stats={stats} failed={failed} onReload={reload} />;
}
