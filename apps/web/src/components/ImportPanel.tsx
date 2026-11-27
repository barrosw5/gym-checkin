import { Upload } from "lucide-react";
import { useState } from "react";
import type { ImportResult } from "../core/types/adminUsers";
import { useTranslation } from "../hooks/useTranslation";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { ICON } from "./ui/icon";

export interface ImportPanelProps {
  result: ImportResult | null;
  busy: boolean;
  /** Demo account: the form is shown, but nothing can be sent. */
  readOnly: boolean;
  onImport: (csv: string) => void;
  onClearResult: () => void;
}

/** Admin: create member accounts from a CSV file or pasted lines. */
export default function ImportPanel({ result, busy, readOnly, onImport, onClearResult }: ImportPanelProps) {
  const { t, tm } = useTranslation();
  const [csv, setCsv] = useState("");
  const example = t("users.csvExample");

  return (
    <Card title={t("users.importTitle")}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          {/* The header line of the example is the format to follow */}
          <p className="text-sm text-ink-2">{t("users.importHelp", { format: example.split("\n")[0] })}</p>
          <label className="text-sm font-medium text-ink-2">
            {t("users.csvFile")}
            <input
              type="file"
              accept=".csv,text/csv,text/plain"
              disabled={readOnly}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) setCsv(await file.text());
              }}
              // py-1 around the 36 px button: the whole input (44 px) opens the picker
              className="mt-1.5 block w-full py-1 text-sm text-ink-2 file:mr-3 file:h-9 file:rounded-lg file:border-0 file:bg-raised file:px-3 file:font-medium file:text-ink hover:file:bg-line-strong disabled:cursor-not-allowed"
            />
          </label>
          {readOnly && <p className="text-sm text-ink-2">{t("users.demoDisabled")}</p>}
        </div>
        <div className="flex flex-col gap-3">
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={example}
            rows={5}
            disabled={readOnly}
            aria-label={t("users.csvContent")}
            // 16 px on phones: below that, iOS zooms the page in on focus
            className="w-full rounded-lg bg-surface p-3 font-mono text-base ring-1 ring-inset ring-line-strong focus:ring-2 focus:ring-accent-ink focus:outline-none disabled:cursor-not-allowed sm:text-sm"
          />
          <Button onClick={() => onImport(csv)} loading={busy} disabled={readOnly || !csv.trim()}>
            {!busy && <Upload {...ICON} />}
            {busy ? t("users.importing") : t("users.import")}
          </Button>
        </div>
      </div>

      {result?.ok === false && (
        <Alert tone="error" className="mt-4">
          <p>{t("users.importFailed")}</p>
          <ul className="mt-1 list-disc pl-4">
            {result.errors.map((e) => (
              <li key={e.line}>
                {e.line > 0 && `${t("users.line", { line: e.line })} `}
                {e.messages.map(tm).join("; ")}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {result?.ok && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl bg-warn-soft p-3 ring-1 ring-inset ring-warn/20">
          <p className="text-sm text-warn">
            <span className="font-medium">
              {result.created.length === 1
                ? t("users.createdOne")
                : t("users.createdMany", { count: result.created.length })}
            </span>
            . {t("users.tempPasswordsWarning")}
          </p>
          <table className="w-full text-left text-sm">
            <thead className="text-ink-3">
              <tr>
                <th className="py-1 font-medium">{t("users.username")}</th>
                <th className="py-1 font-medium">{t("users.tempPassword")}</th>
              </tr>
            </thead>
            <tbody>
              {result.created.map((a) => (
                <tr key={a.username} className="border-t border-warn/15">
                  <td className="py-1.5 wrap-anywhere">{a.username}</td>
                  <td className="py-1.5 font-mono">{a.temporaryPassword}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button size="sm" variant="secondary" onClick={onClearResult}>
            {t("users.hidePasswords")}
          </Button>
        </div>
      )}
    </Card>
  );
}
