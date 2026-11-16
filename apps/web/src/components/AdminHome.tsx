import { Link } from "react-router-dom";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import { useTranslation } from "../hooks/useTranslation";
import AccountActions from "./AccountActions";
import PageLayout from "./ui/PageLayout";
import OccupancyCounter from "./OccupancyCounter";
import PendingRequests from "./PendingRequests";
import SessionsToday from "./SessionsToday";
import UsersAdmin from "./UsersAdmin";

/** Admin panel: everything reception does, plus accounts. No check-in. */
export default function AdminHome() {
  const user = useAuthenticatedUser();
  const { t } = useTranslation();

  return (
    <PageLayout width="wide" title={t("admin.title")} subtitle={t("common.hello", { name: user.name })}>
      <p>
        {/* New tab: the screen stays open full screen on the reception PC */}
        <Link
          to="/reception/screen"
          target="_blank"
          className="font-semibold text-navy-700 underline underline-offset-4"
        >
          {t("common.openQrScreen")}
        </Link>
      </p>
      <OccupancyCounter />
      <PendingRequests />
      <SessionsToday />
      <UsersAdmin />
      <AccountActions />
    </PageLayout>
  );
}
