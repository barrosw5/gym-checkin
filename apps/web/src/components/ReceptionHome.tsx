import { Link } from "react-router-dom";
import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import { useTranslation } from "../hooks/useTranslation";
import AccountActions from "./AccountActions";
import PageLayout from "./ui/PageLayout";
import OccupancyCounter from "./OccupancyCounter";
import PendingRequests from "./PendingRequests";
import SessionsToday from "./SessionsToday";

/** Reception panel (staff PC): requests, today's sessions, the QR screen. */
export default function ReceptionHome() {
  const user = useAuthenticatedUser();
  const { t } = useTranslation();

  return (
    <PageLayout width="wide" title={t("reception.title")} subtitle={t("common.hello", { name: user.name })}>
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
      {/* Here, not on the QR screen: that one faces students (names, GDPR) */}
      <PendingRequests />
      <SessionsToday />
      <AccountActions />
    </PageLayout>
  );
}
