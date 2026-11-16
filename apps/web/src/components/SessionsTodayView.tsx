import { KeyRound, Pencil } from "lucide-react";
import { useState } from "react";
import type { Translatable } from "../core/i18n/types";
import type { AdminSession } from "../core/types/adminSessions";
import { formatTime } from "../core/utils/format";
import { useTranslation } from "../hooks/useTranslation";
import SessionCorrectionForm from "./SessionCorrectionForm";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { ICON } from "./ui/icon";
import KeyTag from "./ui/KeyTag";
import SegmentedControl from "./ui/SegmentedControl";
import TodayTimeline from "./TodayTimeline";

export interface SessionsTodayViewProps {
  sessions: AdminSession[] | null;
  /** When the list was loaded: open visits run up to here on the timeline. */
  now: Date;
  failed: boolean;
  busyId: string | null;
  message: Translatable | null;
  onReload: () => void;
  onCloseNow: (id: string) => void;
  /** Resolves true when saved, so the form can close. */
  onCorrect: (id: string, entryLocal: string, exitLocal: string) => Promise<boolean>;
}

/** Reception: who came today, close a session (key returned), fix wrong times. */
export default function SessionsTodayView({
  sessions,
  now,
  failed,
  busyId,
  message,
  onReload,
  onCloseNow,
  onCorrect,
}: SessionsTodayViewProps) {
  const { t, tm, languageTag } = useTranslation();
  // Which row has its correction form open: UI state of this list only
  const [editing, setEditing] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "timeline">("list");
  const inside = sessions?.filter((s) => !s.exitAt).length ?? 0;

  return (
    <Card title={t("sessions.title")} meta={sessions && sessions.length > 0 ? `${inside}/${sessions.length}` : undefined}>
      {failed && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-slate-600">{t("common.loadFailed")}</p>
          <Button size="sm" variant="secondary" onClick={onReload}>
            {t("common.retry")}
          </Button>
        </div>
      )}
      {sessions === null && !failed && <p className="text-sm text-slate-500">{t("common.loading")}</p>}
      {sessions?.length === 0 && <p className="text-sm text-slate-500">{t("sessions.none")}</p>}

      {sessions && sessions.length > 0 && (
        <SegmentedControl
          label={t("sessions.view")}
          options={[
            { value: "list", label: t("sessions.viewList") },
            { value: "timeline", label: t("sessions.viewTimeline") },
          ]}
          value={view}
          onChange={setView}
          className="mb-4"
        />
      )}

      {sessions && sessions.length > 0 && view === "timeline" && <TodayTimeline sessions={sessions} now={now} />}

      {sessions && sessions.length > 0 && view === "list" && (
        <ul className="-my-3 divide-y divide-slate-900/[0.06]">
          {sessions.map((s) => (
            <li key={s.id} className="py-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="min-w-48 flex-1">
                  <p className="flex items-center gap-2 font-medium text-slate-900">
                    {s.name}
                    <KeyTag room={s.room} />
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-sm text-slate-500 tabular-nums">
                    {formatTime(s.entryAt, languageTag)} – {s.exitAt ? formatTime(s.exitAt, languageTag) : "…"}
                    {!s.exitAt && (
                      <span className="flex items-center gap-1.5 font-medium text-green-700">
                        <span aria-hidden="true" className="size-2 rounded-full bg-green-600" />
                        {t("sessions.insideNow")}
                      </span>
                    )}
                    {s.closedBy === "AUTO" && <span>· {t("sessions.autoClosed")}</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(editing === s.id ? null : s.id)}
                    aria-expanded={editing === s.id}
                  >
                    <Pencil {...ICON} />
                    {t("sessions.correct")}
                  </Button>
                  {!s.exitAt && (
                    <Button size="sm" variant="secondary" loading={busyId === s.id} onClick={() => onCloseNow(s.id)}>
                      {busyId !== s.id && <KeyRound {...ICON} />}
                      {t("sessions.close")}
                    </Button>
                  )}
                </div>
              </div>
              {editing === s.id && (
                <SessionCorrectionForm
                  session={s}
                  busy={busyId === s.id}
                  onSave={async (entry, exit) => {
                    if (await onCorrect(s.id, entry, exit)) setEditing(null);
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      {message && <Alert tone="error" className="mt-4">{tm(message)}</Alert>}
    </Card>
  );
}
