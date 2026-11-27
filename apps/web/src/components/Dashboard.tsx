import { useDashboard } from "../hooks/useDashboard";
import { useTranslation } from "../hooks/useTranslation";
import CheckinButton from "./CheckinButton";
import OccupancyCounter from "./OccupancyCounter";
import MemberBib from "./ui/MemberBib";
import Page from "./ui/Page";

/** Student home (phone first): how full the gym is, and the way in/out. */
export default function Dashboard() {
  const { user } = useDashboard();
  const { t } = useTranslation();

  return (
    <Page
      width="medium"
      title={t("dashboard.title")}
      subtitle={
        <>
          <span>{user.name}</span>
          <MemberBib room={user.room} />
        </>
      }
    >
      {/* Stacked on a phone, side by side on a PC */}
      <div className="grid items-start gap-4 md:grid-cols-2">
        <OccupancyCounter />
        <CheckinButton />
      </div>
    </Page>
  );
}
