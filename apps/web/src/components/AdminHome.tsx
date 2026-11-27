import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import { useTranslation } from "../hooks/useTranslation";
import AccountActions from "./AccountActions";
import OccupancyCounter from "./OccupancyCounter";
import PendingRequests from "./PendingRequests";
import QrScreenLink from "./QrScreenLink";
import SessionsToday from "./SessionsToday";
import StatsLink from "./StatsLink";
import UsersAdmin from "./UsersAdmin";
import PageLayout from "./ui/PageLayout";

/** Admin desk: everything reception does, plus accounts. No check-in. */
export default function AdminHome() {
  const user = useAuthenticatedUser();
  const { t } = useTranslation();

  return (
    <PageLayout width="wide" title={t("admin.title")} subtitle={t("common.signedInAs", { name: user.name })}>
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-4">
          <OccupancyCounter />
          <QrScreenLink />
          <StatsLink />
        </div>
        <div className="flex flex-col gap-4">
          <PendingRequests />
          <SessionsToday />
        </div>
      </div>
      <h2 className="mt-4 text-xl font-medium text-ink">{t("users.title")}</h2>
      <UsersAdmin />
      <AccountActions />
    </PageLayout>
  );
}
