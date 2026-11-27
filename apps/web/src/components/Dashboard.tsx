import { lazy, Suspense } from "react";
import { useDashboard } from "../hooks/useDashboard";
import { useTranslation } from "../hooks/useTranslation";
import CheckinButton from "./CheckinButton";
import OccupancyCounter from "./OccupancyCounter";
import MemberBib from "./ui/MemberBib";
import Page from "./ui/Page";

// The charts library arrives after the check-in button is already usable
const TodayOutlook = lazy(() => import("./TodayOutlook"));

/** Student home (phone first): how full the gym is, the way in/out, and today. */
export default function Dashboard() {
  const { user } = useDashboard();
  const { t } = useTranslation();

  return (
    <Page
      width="wide"
      title={t("dashboard.title")}
      subtitle={
        <>
          <span>{user.name}</span>
          <MemberBib room={user.room} />
        </>
      }
    >
      {/* Stacked on a phone; on a PC the panel leads and both share a height */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] [&_section]:h-full">
        {/* data-theme: the occupancy is a graphite panel in both themes */}
        <div data-theme="dark" className="text-ink">
          <OccupancyCounter large />
        </div>
        <div className="[&_section]:flex [&_section]:flex-col [&_section]:justify-center">
          <CheckinButton />
        </div>
      </div>
      <Suspense fallback={null}>
        <TodayOutlook />
      </Suspense>
    </Page>
  );
}
