import { useState } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useUsersAdmin } from "../hooks/useUsersAdmin";
import UserRow from "./UserRow";

/** Admin panel section: import residents from a CSV, manage accounts. */
export default function UsersAdmin() {
  const { users, failed, importResult, busy, message, reload, importCsv, clearImportResult, update } =
    useUsersAdmin();
  const { t, tm } = useTranslation();
  const [csv, setCsv] = useState("");
  const example = t("users.csvExample");

  return (
    <section aria-labelledby="users-admin-title" style={{ margin: "30px 0" }}>
      <h2 id="users-admin-title">{t("users.title")}</h2>

      <section aria-labelledby="import-title" style={{ margin: "30px 0" }}>
        <h3 id="import-title">{t("users.importTitle")}</h3>
        {/* The header line of the example is the format to follow */}
        <p>{t("users.importHelp", { format: example.split("\n")[0] })}</p>
        <label>
          {t("users.csvFile")}{" "}
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) setCsv(await file.text());
            }}
          />
        </label>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder={example}
          rows={8}
          aria-label={t("users.csvContent")}
          style={{ display: "block", width: "100%", marginTop: "10px", fontFamily: "monospace" }}
        />
        <button
          onClick={() => importCsv(csv)}
          disabled={busy || !csv.trim()}
          style={{ marginTop: "10px", padding: "10px 16px" }}
        >
          {busy ? t("users.importing") : t("users.import")}
        </button>

        {importResult?.ok === false && (
          <div role="alert" style={{ color: "#c53030" }}>
            <p>{t("users.importFailed")}</p>
            <ul>
              {importResult.errors.map((e) => (
                <li key={e.line}>
                  {e.line > 0 && `${t("users.line", { line: e.line })} `}
                  {e.messages.map(tm).join("; ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        {importResult?.ok && (
          <div role="status" style={{ border: "2px solid #dd6b20", padding: "12px", marginTop: "10px" }}>
            <p>
              <strong>
                {importResult.created.length === 1
                  ? t("users.createdOne")
                  : t("users.createdMany", { count: importResult.created.length })}
              </strong>{" "}
              {t("users.tempPasswordsWarning")}
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">{t("users.name")}</th>
                  <th align="left">{t("users.username")}</th>
                  <th align="left">{t("users.tempPassword")}</th>
                </tr>
              </thead>
              <tbody>
                {importResult.created.map((a) => (
                  <tr key={a.username}>
                    <td>{a.name}</td>
                    <td>{a.username}</td>
                    <td>
                      <code>{a.temporaryPassword}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={clearImportResult} style={{ marginTop: "10px", padding: "8px 16px" }}>
              {t("users.hidePasswords")}
            </button>
          </div>
        )}
      </section>

      <section aria-labelledby="users-title">
        <h3 id="users-title">{t("users.accounts")}</h3>
        {failed && (
          <p>
            {t("common.loadFailed")} <button onClick={reload}>{t("common.retry")}</button>
          </p>
        )}
        {users === null && !failed && <p>{t("common.loading")}</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users?.map((u) => (
            <UserRow key={u.id} user={u} busy={busy} onUpdate={(body) => update(u.id, body)} />
          ))}
        </ul>
      </section>

      {message && (
        <p role="alert" style={{ color: "#c53030" }}>
          {tm(message)}
        </p>
      )}
    </section>
  );
}
