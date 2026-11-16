import { useDashboard } from "../hooks/useDashboard";
import { useTranslation } from "../hooks/useTranslation";
import AccountActions from "./AccountActions";
import CheckinButton from "./CheckinButton";
import OccupancyCounter from "./OccupancyCounter";

/** Student home: how full the gym is, and the way in/out. */
export default function Dashboard() {
  const { user } = useDashboard();
  const { t } = useTranslation();

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", padding: "0 16px", fontFamily: "sans-serif" }}>
      <h1>{t("dashboard.welcome", { name: user.name })}</h1>
      <p>{t("dashboard.room", { room: user.room })}</p>

      <OccupancyCounter />
      <CheckinButton />
      <AccountActions />
    </div>
  );
}
