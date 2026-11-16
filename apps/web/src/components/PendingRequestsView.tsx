import { Check, WifiOff, X } from "lucide-react";
import type { Translatable } from "../core/i18n/types";
import type { PendingRequest, RequestDecision } from "../core/types/requests";
import { formatTimeWithSeconds } from "../core/utils/format";
import { useTranslation } from "../hooks/useTranslation";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { ICON } from "./ui/icon";
import KeyTag from "./ui/KeyTag";

export interface PendingRequestsViewProps {
  /** null while the live list connects. */
  requests: PendingRequest[] | null;
  stale: boolean;
  /** The request being decided: its buttons are disabled. */
  busyId: string | null;
  message: Translatable | null;
  onDecide: (id: string, decision: RequestDecision) => void;
}

/** Reception: who is asking to enter, oldest first (first come, first served). */
export default function PendingRequestsView({ requests, stale, busyId, message, onDecide }: PendingRequestsViewProps) {
  const { t, tm, languageTag } = useTranslation();

  return (
    <Card title={t("requests.title")} meta={requests && requests.length > 0 ? requests.length : undefined}>
      {requests === null && <p className="text-sm text-slate-500">{t("common.loading")}</p>}
      {requests?.length === 0 && <p className="text-sm text-slate-500">{t("requests.none")}</p>}

      {requests && requests.length > 0 && (
        <ul className="-my-3 divide-y divide-slate-900/[0.06]">
          {requests.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3">
              <div className="min-w-48 flex-1">
                <p className="flex items-center gap-2 font-medium text-slate-900">
                  {r.name}
                  <KeyTag room={r.room} />
                </p>
                <p className="mt-0.5 text-sm text-slate-500 tabular-nums">
                  {t("requests.requestedAt", { time: formatTimeWithSeconds(r.createdAt, languageTag) })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={busyId === r.id} onClick={() => onDecide(r.id, "reject")}>
                  <X {...ICON} />
                  {t("requests.reject")}
                </Button>
                <Button size="sm" loading={busyId === r.id} onClick={() => onDecide(r.id, "approve")}>
                  {busyId !== r.id && <Check {...ICON} />}
                  {t("requests.accept")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {message && <Alert tone="error" className="mt-4">{tm(message)}</Alert>}
      {stale && (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <WifiOff {...ICON} />
          {t("common.reconnecting")}
        </p>
      )}
    </Card>
  );
}
