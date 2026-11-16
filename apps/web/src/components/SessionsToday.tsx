import { useState } from "react";
import { formatTime } from "../core/utils/format";
import { useSessionsToday } from "../hooks/useSessionsToday";
import { useTranslation } from "../hooks/useTranslation";
import SessionCorrectionForm from "./SessionCorrectionForm";

/** Reception panel: who came today, close a session, fix wrong times. */
export default function SessionsToday() {
  const { sessions, failed, busyId, message, reload, closeNow, correctTimes } = useSessionsToday();
  const { t, tm, languageTag } = useTranslation();
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <section aria-labelledby="today-title" style={{ margin: "30px 0" }}>
      <h2 id="today-title">{t("sessions.title")}</h2>

      {failed && (
        <p>
          {t("common.loadFailed")} <button onClick={reload}>{t("common.retry")}</button>
        </p>
      )}
      {sessions === null && !failed && <p>{t("common.loading")}</p>}
      {sessions?.length === 0 && <p>{t("sessions.none")}</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sessions?.map((s) => (
          <li key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <span style={{ flex: "1 1 200px" }}>
                <strong>{s.name}</strong> · {t("common.room", { room: s.room })}
                <br />
                <small>
                  {formatTime(s.entryAt, languageTag)} →{" "}
                  {s.exitAt ? formatTime(s.exitAt, languageTag) : t("sessions.insideNow")}
                  {s.closedBy === "AUTO" && ` ${t("sessions.autoClosed")}`}
                </small>
              </span>
              {!s.exitAt && (
                <button
                  onClick={() => closeNow(s.id)}
                  disabled={busyId === s.id}
                  style={{ padding: "10px 16px", background: "#dd6b20", color: "white", border: "none" }}
                >
                  {t("sessions.close")}
                </button>
              )}
              <button
                onClick={() => setEditing(editing === s.id ? null : s.id)}
                aria-expanded={editing === s.id}
                style={{ padding: "10px 16px" }}
              >
                {t("sessions.correct")}
              </button>
            </div>
            {editing === s.id && (
              <SessionCorrectionForm
                session={s}
                busy={busyId === s.id}
                onSave={async (entry, exit) => {
                  if (await correctTimes(s.id, entry, exit)) setEditing(null);
                }}
              />
            )}
          </li>
        ))}
      </ul>

      {message && (
        <p role="alert" style={{ color: "#c53030" }}>
          {tm(message)}
        </p>
      )}
    </section>
  );
}
