import { useDashboard } from "../hooks/useDashboard";
import { useTranslation } from "../hooks/useTranslation";
import AccountActions from "./AccountActions";
import CheckinButton from "./CheckinButton";
import OccupancyCounter from "./OccupancyCounter";
import PageLayout from "./ui/PageLayout";

/** Student home (phone first): how full the gym is, and the way in/out. */
export default function Dashboard() {
  const { user } = useDashboard();
  const { t } = useTranslation();

  return (
    <PageLayout
      title={t("dashboard.welcome", { name: user.name })}
      subtitle={t("dashboard.room", { room: user.room })}
    >
      <OccupancyCounter />
      <CheckinButton />
      <AccountActions />
    </PageLayout>
  );
}
