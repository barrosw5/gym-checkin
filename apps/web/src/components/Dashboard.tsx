import { useDashboard } from "../hooks/useDashboard";
import { useTranslation } from "../hooks/useTranslation";
import AccountActions from "./AccountActions";
import CheckinButton from "./CheckinButton";
import OccupancyCounter from "./OccupancyCounter";
import StatsLink from "./StatsLink";
import MemberBib from "./ui/MemberBib";
import PageLayout from "./ui/PageLayout";

/** Student home (phone first): how full the gym is, and the way in/out. */
export default function Dashboard() {
  const { user } = useDashboard();
  const { t } = useTranslation();

  return (
    <PageLayout
      title={t("dashboard.title")}
      subtitle={
        <>
          <span>{user.name}</span>
          <MemberBib room={user.room} />
        </>
      }
    >
      <OccupancyCounter />
      <CheckinButton />
      <StatsLink />
      <AccountActions />
    </PageLayout>
  );
}
