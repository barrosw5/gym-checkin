import { useTranslation } from "../hooks/useTranslation";
import OccupancyCounter from "./OccupancyCounter";
import PendingRequests from "./PendingRequests";
import SessionsToday from "./SessionsToday";
import Page from "./ui/Page";

/** The desk (reception and admin): the gym at a glance, then the work. */
export default function ReceptionHome() {
  const { t } = useTranslation();

  return (
    <Page width="wide" title={t("reception.title")}>
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_2fr]">
        <OccupancyCounter />
        <div className="flex flex-col gap-4">
          {/* Here, not on the QR screen: that one faces students (names, GDPR) */}
          <PendingRequests />
          <SessionsToday />
        </div>
      </div>
    </Page>
  );
}
