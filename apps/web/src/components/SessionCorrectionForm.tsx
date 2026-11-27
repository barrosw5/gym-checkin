import { useState } from "react";
import type { AdminSession } from "../core/types/adminSessions";
import { toLocalInput } from "../core/utils/format";
import { useTranslation } from "../hooks/useTranslation";
import Button from "./ui/Button";
import TextField from "./ui/TextField";

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
      className="mt-3 flex flex-wrap items-end gap-3 rounded-xl bg-raised p-3"
    >
      <TextField
        label={t("sessions.entry")}
        type="datetime-local"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        required
        className="min-w-52 flex-1"
      />
      <TextField
        label={t("sessions.exit")}
        type="datetime-local"
        value={exit}
        onChange={(e) => setExit(e.target.value)}
        className="min-w-52 flex-1"
      />
      <Button type="submit" loading={busy}>
        {t("common.save")}
      </Button>
    </form>
  );
}
