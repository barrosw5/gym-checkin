import { Upload } from "lucide-react";
import { useState } from "react";
import type { Translatable } from "../core/i18n/types";
import type { AdminUser, ImportResult } from "../core/types/adminUsers";
import { useTranslation } from "../hooks/useTranslation";
import UserRow from "./UserRow";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { ICON } from "./ui/icon";

export interface UsersAdminViewProps {
  users: AdminUser[] | null;
  failed: boolean;
  importResult: ImportResult | null;
  busy: boolean;
  message: Translatable | null;
  onReload: () => void;
  onImport: (csv: string) => void;
  onClearImport: () => void;
  onUpdate: (id: string, body: { active?: boolean; room?: string }) => void;
}

/** Admin: import residents from a CSV, then manage the accounts. */
export default function UsersAdminView({
  users,
  failed,
  importResult,
  busy,
  message,
  onReload,
  onImport,
  onClearImport,
  onUpdate,
}: UsersAdminViewProps) {
  const { t, tm } = useTranslation();
  const [csv, setCsv] = useState("");
  const example = t("users.csvExample");

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
      <Card title={t("users.importTitle")}>
        <div className="flex flex-col gap-3">
          {/* The header line of the example is the format to follow */}
          <p className="text-sm text-slate-600">{t("users.importHelp", { format: example.split("\n")[0] })}</p>
          <label className="text-sm font-medium text-slate-700">
            {t("users.csvFile")}
            <input
              type="file"
              accept=".csv,text/csv,text/plain"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) setCsv(await file.text());
              }}
              // py-1 around the 36 px button: the whole input (44 px) opens the picker
              className="mt-1.5 block w-full py-1 text-sm text-slate-600 file:mr-3 file:h-9 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:font-medium file:text-slate-900 hover:file:bg-slate-200"
            />
          </label>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder={example}
            rows={6}
            aria-label={t("users.csvContent")}
            // 16 px on phones: below that, iOS zooms the page in on focus
            className="w-full rounded-lg bg-white p-3 font-mono text-base sm:text-sm ring-1 ring-inset ring-slate-900/15 focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
          <Button onClick={() => onImport(csv)} loading={busy} disabled={!csv.trim()}>
            {!busy && <Upload {...ICON} />}
            {busy ? t("users.importing") : t("users.import")}
          </Button>

          {importResult?.ok === false && (
            <Alert tone="error">
              <p>{t("users.importFailed")}</p>
              <ul className="mt-1 list-disc pl-4">
                {importResult.errors.map((e) => (
                  <li key={e.line}>
                    {e.line > 0 && `${t("users.line", { line: e.line })} `}
                    {e.messages.map(tm).join("; ")}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          {importResult?.ok && (
            <div className="flex flex-col gap-3 rounded-xl bg-ember-50 p-3 ring-1 ring-inset ring-ember-700/20">
              <p className="text-sm text-ember-700">
                <span className="font-medium">
                  {importResult.created.length === 1
                    ? t("users.createdOne")
                    : t("users.createdMany", { count: importResult.created.length })}
                </span>
                . {t("users.tempPasswordsWarning")}
              </p>
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-1 font-medium">{t("users.username")}</th>
                    <th className="py-1 font-medium">{t("users.tempPassword")}</th>
                  </tr>
                </thead>
                <tbody>
                  {importResult.created.map((a) => (
                    <tr key={a.username} className="border-t border-ember-700/10">
                      <td className="py-1.5 wrap-anywhere">{a.username}</td>
                      <td className="py-1.5 font-mono">{a.temporaryPassword}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Button size="sm" variant="secondary" onClick={onClearImport}>
                {t("users.hidePasswords")}
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card title={t("users.accounts")} meta={users?.length}>
        {failed && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-600">{t("common.loadFailed")}</p>
            <Button size="sm" variant="secondary" onClick={onReload}>
              {t("common.retry")}
            </Button>
          </div>
        )}
        {users === null && !failed && <p className="text-sm text-slate-500">{t("common.loading")}</p>}
        {users && (
          <ul className="-my-3 divide-y divide-slate-900/[0.06]">
            {users.map((u) => (
              <UserRow key={u.id} user={u} busy={busy} onUpdate={(body) => onUpdate(u.id, body)} />
            ))}
          </ul>
        )}
        {message && <Alert tone="error" className="mt-4">{tm(message)}</Alert>}
      </Card>
    </div>
  );
}
