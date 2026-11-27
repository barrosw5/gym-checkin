import { Upload } from "lucide-react";
import { useState } from "react";
import type { Translatable } from "../core/i18n/types";
import type { AdminUser, ImportResult } from "../core/types/adminUsers";
import { filterUsers } from "../core/utils/filterUsers";
import { useTranslation } from "../hooks/useTranslation";
import ImportPanel from "./ImportPanel";
import UserRow from "./UserRow";
import Alert from "./ui/Alert";
import Button from "./ui/Button";
import Card from "./ui/Card";
import { ICON } from "./ui/icon";
import Page from "./ui/Page";

export interface UsersAdminViewProps {
  users: AdminUser[] | null;
  failed: boolean;
  importResult: ImportResult | null;
  busy: boolean;
  message: Translatable | null;
  /** Demo admin: everything is visible, changes are switched off. */
  readOnly: boolean;
  onReload: () => void;
  onImport: (csv: string) => void;
  onClearImport: () => void;
  onUpdate: (id: string, body: { active?: boolean; room?: string }) => void;
}

/** Admin: search the accounts, edit one at a time, import from a CSV. */
export default function UsersAdminView({
  users,
  failed,
  importResult,
  busy,
  message,
  readOnly,
  onReload,
  onImport,
  onClearImport,
  onUpdate,
}: UsersAdminViewProps) {
  const { t, tm } = useTranslation();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const shown = users ? filterUsers(users, query) : [];

  return (
    <Page
      width="wide"
      title={t("users.title")}
      actions={
        <Button variant="secondary" onClick={() => setImporting(!importing)} aria-expanded={importing}>
          <Upload {...ICON} />
          {t("users.importTitle")}
        </Button>
      }
    >
      {readOnly && <Alert tone="info">{t("users.demoNotice")}</Alert>}

      {/* Stays open while there is a result: temporary passwords show once */}
      {(importing || importResult) && (
        <ImportPanel
          result={importResult}
          busy={busy}
          readOnly={readOnly}
          onImport={onImport}
          onClearResult={onClearImport}
        />
      )}

      {message && <Alert tone="error">{tm(message)}</Alert>}

      <Card className="!p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
          <h2 className="text-base font-medium text-ink">
            {t("users.accounts")}
            {users && (
              <span className="ml-2 font-normal text-ink-3 tabular-nums">
                {query.trim() ? t("users.found", { shown: shown.length, total: users.length }) : users.length}
              </span>
            )}
          </h2>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("users.search")}
            aria-label={t("users.searchLabel")}
            className="h-11 w-full rounded-lg bg-surface px-3 text-base text-ink ring-1 ring-inset ring-line-strong focus:ring-2 focus:ring-accent-ink focus:outline-none sm:w-72 sm:text-sm"
          />
        </div>

        {failed && (
          <div className="flex flex-wrap items-center gap-3 px-5 pb-5 sm:px-6">
            <p className="text-sm text-ink-2">{t("common.loadFailed")}</p>
            <Button size="sm" variant="secondary" onClick={onReload}>
              {t("common.retry")}
            </Button>
          </div>
        )}
        {users === null && !failed && <p className="px-5 pb-5 text-sm text-ink-3 sm:px-6">{t("common.loading")}</p>}
        {users && shown.length === 0 && <p className="px-5 pb-5 text-sm text-ink-3 sm:px-6">{t("users.noMatch")}</p>}

        {shown.length > 0 && (
          <table className="w-full text-left">
            <thead className="text-sm text-ink-3">
              <tr>
                <th scope="col" className="py-2 pr-3 pl-5 font-normal sm:pl-6">{t("users.name")}</th>
                <th scope="col" className="py-2 pr-3 font-normal">{t("users.number")}</th>
                <th scope="col" className="hidden py-2 pr-3 font-normal md:table-cell">{t("users.role")}</th>
                <th scope="col" className="hidden py-2 pr-3 font-normal md:table-cell">{t("users.state")}</th>
                <th scope="col" className="py-2 pr-5 sm:pr-6">
                  <span className="sr-only">{t("users.edit")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  busy={busy}
                  readOnly={readOnly}
                  editing={editing === u.id}
                  onToggle={() => setEditing(editing === u.id ? null : u.id)}
                  onUpdate={(body) => onUpdate(u.id, body)}
                />
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </Page>
  );
}
