import type { CSSProperties } from "react";
import { formatTime } from "../core/utils/format";
import { useCheckin } from "../hooks/useCheckin";
import { useTranslation } from "../hooks/useTranslation";

const buttonStyle = (color: string, busy: boolean): CSSProperties => ({
  padding: "16px 32px",
  fontSize: "1.2rem",
  backgroundColor: color,
  color: "white",
  border: "none",
  cursor: busy ? "wait" : "pointer",
});

export default function CheckinButton() {
  const { state, busy, message, reload, requestEntry, leave } = useCheckin();
  const { t, tm, languageTag } = useTranslation();

  if (state.status === "loading") {
    return <p>{t("checkin.checking")}</p>;
  }

  if (state.status === "error") {
    return (
      <div>
        <p>{t("checkin.unknown")}</p>
        <button onClick={reload} style={{ padding: "10px" }}>
          {t("common.retry")}
        </button>
      </div>
    );
  }

  return (
    <div style={{ margin: "30px 0" }}>
      {state.status === "in" && (
        <>
          <p>{t("checkin.inSince", { time: formatTime(state.session.entryAt, languageTag) })}</p>
          <button onClick={leave} disabled={busy} style={buttonStyle("#dd6b20", busy)}>
            {busy ? t("common.wait") : t("checkin.leave")}
          </button>
        </>
      )}

      {state.status === "waiting" && (
        // role="status": screen readers announce it without stealing focus
        <p role="status">{t("checkin.waiting")}</p>
      )}

      {state.status === "out" && (
        <>
          <p>{t("checkin.out")}</p>
          {state.methods.includes("RECEPTION_APPROVAL") && (
            <button onClick={requestEntry} disabled={busy} style={buttonStyle("#3182ce", busy)}>
              {busy ? t("common.wait") : t("checkin.requestEntry")}
            </button>
          )}
          {state.methods.includes("SCREEN_QR") && <p>{t("checkin.orScanQr")}</p>}
        </>
      )}

      {/* role="alert": screen readers announce the message when it appears */}
      {message && (
        <p role="alert" style={{ color: "#c53030" }}>
          {tm(message)}
        </p>
      )}
    </div>
  );
}
