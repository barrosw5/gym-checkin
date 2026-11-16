import type { Translatable } from "../core/i18n/types";
import { formatTime } from "../core/utils/format";
import type { CheckinState } from "../hooks/useCheckin";
import { useTranslation } from "../hooks/useTranslation";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Card from "./ui/Card";

export interface CheckinPanelViewProps {
  state: CheckinState;
  /** A request is in flight: the action button shows a spinner. */
  busy: boolean;
  /** Result of the last action (e.g. rejected, expired). */
  message: Translatable | null;
  onReload: () => void;
  onRequestEntry: () => void;
  onLeave: () => void;
}

/** The student's way in and out: the main action on their phone. */
export default function CheckinPanelView({
  state,
  busy,
  message,
  onReload,
  onRequestEntry,
  onLeave,
}: CheckinPanelViewProps) {
  const { t, tm, languageTag } = useTranslation();

  return (
    <Card>
      <div className="flex flex-col gap-4">
        {state.status === "loading" && <p className="text-slate-600">{t("checkin.checking")}</p>}

        {state.status === "error" && (
          <>
            <Alert tone="error">{t("checkin.unknown")}</Alert>
            <Button variant="secondary" onClick={onReload}>
              {t("common.retry")}
            </Button>
          </>
        )}

        {state.status === "in" && (
          <>
            <p className="flex items-center gap-2 text-lg font-semibold text-green-800">
              <span aria-hidden="true" className="size-3 rounded-full bg-green-700" />
              {t("checkin.inSince", { time: formatTime(state.session.entryAt, languageTag) })}
            </p>
            <Button variant="warning" size="lg" fullWidth loading={busy} onClick={onLeave}>
              {t("checkin.leave")}
            </Button>
          </>
        )}

        {state.status === "waiting" && (
          <Alert tone="info">
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-4 shrink-0 animate-spin rounded-full border-2 border-sky-800 border-t-transparent"
              />
              {t("checkin.waiting")}
            </span>
          </Alert>
        )}

        {state.status === "out" && (
          <>
            <p className="text-lg font-semibold text-slate-700">{t("checkin.out")}</p>
            {state.methods.includes("RECEPTION_APPROVAL") && (
              <Button size="lg" fullWidth loading={busy} onClick={onRequestEntry}>
                {t("checkin.requestEntry")}
              </Button>
            )}
            {state.methods.includes("SCREEN_QR") && (
              <p className="text-sm text-slate-600">{t("checkin.orScanQr")}</p>
            )}
          </>
        )}

        {message && <Alert tone="error">{tm(message)}</Alert>}
      </div>
    </Card>
  );
}
