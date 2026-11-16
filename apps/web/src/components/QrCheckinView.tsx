import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { formatTime } from "../core/utils/format";
import type { QrCheckinState } from "../hooks/useQrCheckin";
import { useTranslation } from "../hooks/useTranslation";
import Alert from "./ui/Alert";
import Card from "./ui/Card";

export interface QrCheckinViewProps {
  state: QrCheckinState;
  /** Shown when the student was already inside (the leave button). */
  alreadyIn: ReactNode;
}

/** Landing page of the reception QR (/c/<token>), built for phones. */
export default function QrCheckinView({ state, alreadyIn }: QrCheckinViewProps) {
  const { t, tm, languageTag } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      {state.status === "working" && (
        <Card>
          <p className="text-sm text-slate-500">{t("qrCheckin.working")}</p>
        </Card>
      )}

      {state.status === "checked-in" && (
        // role="status": screen readers announce the result
        <Card>
          <div role="status" className="flex flex-col items-start gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-green-50 text-green-700">
              <CircleCheck size={28} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-medium text-slate-900">{t("qrCheckin.success")}</h1>
            <p className="text-slate-600 tabular-nums">
              {t("qrCheckin.successAt", { time: formatTime(state.session.entryAt, languageTag) })}
            </p>
            <p className="text-sm text-slate-500">{t("qrCheckin.howToLeave")}</p>
          </div>
        </Card>
      )}

      {state.status === "already-in" && (
        <>
          <h1 className="text-2xl font-medium text-slate-900">{t("qrCheckin.alreadyIn")}</h1>
          {alreadyIn}
        </>
      )}

      {state.status === "error" && (
        <Card>
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-medium text-slate-900">{t("qrCheckin.failed")}</h1>
            <Alert tone="error">{tm(state.message)}</Alert>
          </div>
        </Card>
      )}

      {state.status !== "working" && (
        <Link to="/dashboard" className="inline-flex h-11 items-center font-medium text-navy-700 hover:text-navy-900">
          {t("common.goHome")}
        </Link>
      )}
    </div>
  );
}
