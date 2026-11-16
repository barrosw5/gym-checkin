import { useState } from "react";
import type { AdminSession } from "../core/types/adminSessions";
import { toLocalInput } from "../core/utils/format";
import { useTranslation } from "../hooks/useTranslation";

interface SessionCorrectionFormProps {
  session: AdminSession;
  busy: boolean;
  /** Values as typed (local time, "YYYY-MM-DDTHH:mm"); empty exit = unchanged. */
  onSave: (entryLocal: string, exitLocal: string) => void;
}

/** Reception: fix the entry/exit times of one session. */
export default function SessionCorrectionForm({ session, busy, onSave }: SessionCorrectionFormProps) {
  const { t } = useTranslation();
  // Local form state only: what is being typed, not app state
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
        {t("sessions.entry")}{" "}
        <input type="datetime-local" value={entry} onChange={(e) => setEntry(e.target.value)} required />
      </label>
      <label>
        {t("sessions.exit")}{" "}
        <input type="datetime-local" value={exit} onChange={(e) => setExit(e.target.value)} />
      </label>
      <button type="submit" disabled={busy} style={{ padding: "8px 16px" }}>
        {t("common.save")}
      </button>
    </form>
  );
}
