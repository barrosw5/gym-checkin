import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import { useTranslation } from "../hooks/useTranslation";
import AccountActions from "./AccountActions";
import OccupancyCounter from "./OccupancyCounter";
import PendingRequests from "./PendingRequests";
import QrScreenLink from "./QrScreenLink";
import SessionsToday from "./SessionsToday";
import StatsLink from "./StatsLink";
import PageLayout from "./ui/PageLayout";

/** Reception desk (PC): the gym at a glance on the left, the work on the right. */
export default function ReceptionHome() {
  const user = useAuthenticatedUser();
  const { t } = useTranslation();

  return (
    <PageLayout width="wide" title={t("reception.title")} subtitle={t("common.signedInAs", { name: user.name })}>
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-4">
          <OccupancyCounter />
          <QrScreenLink />
          <StatsLink />
        </div>
        <div className="flex flex-col gap-4">
          {/* Here, not on the QR screen: that one faces students (names, GDPR) */}
          <PendingRequests />
          <SessionsToday />
        </div>
      </div>
      <AccountActions />
    </PageLayout>
  );
}
