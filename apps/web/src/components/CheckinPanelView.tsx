import { LoaderCircle, LogIn, LogOut, QrCode } from "lucide-react";
import type { Translatable } from "../core/i18n/types";
import { formatTime } from "../core/utils/format";
import type { CheckinState } from "../hooks/useCheckin";
import { useTranslation } from "../hooks/useTranslation";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { ICON } from "./ui/icon";

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
        {state.status === "loading" && <p className="text-sm text-ink-3">{t("checkin.checking")}</p>}

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
            <p className="flex items-center gap-2.5 text-[15px] font-medium text-ink tabular-nums">
              <span aria-hidden="true" className="size-2.5 rounded-full bg-data ring-4 ring-data/20" />
              {t("checkin.inSince", { time: formatTime(state.session.entryAt, languageTag) })}
            </p>
            <Button size="lg" fullWidth loading={busy} onClick={onLeave}>
              {!busy && <LogOut {...ICON} />}
              {t("checkin.leave")}
            </Button>
          </>
        )}

        {state.status === "waiting" && (
          <Alert tone="info" icon={<LoaderCircle {...ICON} className="animate-spin" />}>
            {t("checkin.waiting")}
          </Alert>
        )}

        {state.status === "out" && (
          <>
            <p className="text-[15px] text-ink-2">{t("checkin.out")}</p>
            {state.methods.includes("RECEPTION_APPROVAL") && (
              <Button size="lg" fullWidth loading={busy} onClick={onRequestEntry}>
                {!busy && <LogIn {...ICON} />}
                {t("checkin.requestEntry")}
              </Button>
            )}
            {state.methods.includes("SCREEN_QR") && (
              <p className="flex items-center gap-2 text-sm text-ink-3">
                <QrCode {...ICON} className="shrink-0" />
                {t("checkin.orScanQr")}
              </p>
            )}
          </>
        )}

        {message && <Alert tone="error">{tm(message)}</Alert>}
      </div>
    </Card>
  );
}
