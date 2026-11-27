import { useTranslation } from "../hooks/useTranslation";
import OccupancyCounter from "./OccupancyCounter";
import PendingRequests from "./PendingRequests";
import SessionsToday from "./SessionsToday";
import Page from "./ui/Page";

/**
 * The desk (reception and admin). On a PC it fits one screen: who is inside
 * and who is asking on the left, today's visits scrolling on the right.
 */
export default function ReceptionHome() {
  const { t } = useTranslation();

  return (
    <Page width="wide" title={t("reception.title")}>
      <div className="grid items-start gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          {/* data-theme: the occupancy is a graphite panel in both themes */}
          <div data-theme="dark" className="text-ink">
            <OccupancyCounter />
          </div>
          {/* Here, not on the QR screen: that one faces students (names, GDPR) */}
          <PendingRequests />
        </div>
        <SessionsToday />
      </div>
    </Page>
  );
}
