import { useState } from "react";
import { formatTime } from "../core/utils/format";
import { useSessionsToday } from "../hooks/useSessionsToday";
import SessionCorrectionForm from "./SessionCorrectionForm";

/** Reception panel: who came today, close a session, fix wrong times. */
export default function SessionsToday() {
  const { sessions, failed, busyId, message, reload, closeNow, correctTimes } =
    useSessionsToday();
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <section aria-labelledby="today-title" style={{ margin: "30px 0" }}>
      <h2 id="today-title">Sessões de hoje</h2>

      {failed && (
        <p>
          Não foi possível carregar. <button onClick={reload}>Tentar outra vez</button>
        </p>
      )}
      {sessions === null && !failed && <p>A carregar...</p>}
      {sessions?.length === 0 && <p>Ainda ninguém veio ao ginásio hoje.</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sessions?.map((s) => (
          <li key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
              <span style={{ flex: "1 1 200px" }}>
                <strong>{s.name}</strong> · Quarto {s.room}
                <br />
                <small>
                  {formatTime(s.entryAt)} → {s.exitAt ? formatTime(s.exitAt) : "dentro agora"}
                  {s.closedBy === "AUTO" && " (fechada automaticamente)"}
                </small>
              </span>
              {!s.exitAt && (
                <button
                  onClick={() => closeNow(s.id)}
                  disabled={busyId === s.id}
                  style={{ padding: "10px 16px", background: "#dd6b20", color: "white", border: "none" }}
                >
                  Fechar (entregou a chave)
                </button>
              )}
              <button
                onClick={() => setEditing(editing === s.id ? null : s.id)}
                aria-expanded={editing === s.id}
                style={{ padding: "10px 16px" }}
              >
                Corrigir
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
          {message}
        </p>
      )}
    </section>
  );
}
