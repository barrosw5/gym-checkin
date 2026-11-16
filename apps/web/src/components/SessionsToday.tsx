import { useState } from "react";
import { toLocalInput } from "../core/services/sessionsTodayService";
import type { AdminSession } from "../core/types/adminSessions";
import { useSessionsToday } from "../hooks/useSessionsToday";

const time = new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" });

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
                  {time.format(s.entryAt)} → {s.exitAt ? time.format(s.exitAt) : "dentro agora"}
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
              <CorrectionForm
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

function CorrectionForm(props: {
  session: AdminSession;
  busy: boolean;
  onSave: (entryLocal: string, exitLocal: string) => void;
}) {
  const { session, busy, onSave } = props;
  const [entry, setEntry] = useState(toLocalInput(session.entryAt));
  const [exit, setExit] = useState(session.exitAt ? toLocalInput(session.exitAt) : "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(entry, exit);
      }}
      style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}
    >
      <label>
        Entrada{" "}
        <input
          type="datetime-local"
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          required
        />
      </label>
      <label>
        Saída{" "}
        <input type="datetime-local" value={exit} onChange={(e) => setExit(e.target.value)} />
      </label>
      <button type="submit" disabled={busy} style={{ padding: "8px 16px" }}>
        Guardar
      </button>
    </form>
  );
}
