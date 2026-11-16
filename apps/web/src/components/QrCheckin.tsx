import { Link } from "react-router-dom";
import { formatTime } from "../core/utils/format";
import { useQrCheckin } from "../hooks/useQrCheckin";
import { useTranslation } from "../hooks/useTranslation";
import CheckinButton from "./CheckinButton";
import PageLayout from "./ui/PageLayout";

/** Landing page of the reception QR (/c/<token>), built for phones. */
export default function QrCheckin() {
  const { state } = useQrCheckin();
  const { t, tm, languageTag } = useTranslation();

  return (
    <PageLayout>
      <div className="text-center">
      {state.status === "working" && <p>{t("qrCheckin.working")}</p>}

      {state.status === "checked-in" && (
        // role="status": screen readers announce the result
        <div role="status">
          <p style={{ fontSize: "4rem", margin: 0 }} aria-hidden="true">
            ✅
          </p>
          <h1>{t("qrCheckin.success")}</h1>
          <p>{t("qrCheckin.successAt", { time: formatTime(state.session.entryAt, languageTag) })}</p>
          <p>{t("qrCheckin.howToLeave")}</p>
        </div>
      )}

      {state.status === "already-in" && (
        <div>
          <h1>{t("qrCheckin.alreadyIn")}</h1>
          {/* Scanning on the way out: offer to leave right here */}
          <CheckinButton />
        </div>
      )}

      {state.status === "error" && (
        <div role="alert">
          <h1>{t("qrCheckin.failed")}</h1>
          <p>{tm(state.message)}</p>
        </div>
      )}

      {state.status !== "working" && <Link to="/dashboard">{t("common.goHome")}</Link>}
      </div>
    </PageLayout>
  );
}
