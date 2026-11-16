import { useUsersAdmin } from "../hooks/useUsersAdmin";
import UsersAdminView from "./UsersAdminView";

/** Accounts: connects the hook (API) to the view. */
export default function UsersAdmin() {
  const { users, failed, importResult, busy, message, reload, importCsv, clearImportResult, update } = useUsersAdmin();

  return (
    <UsersAdminView
      users={users}
      failed={failed}
      importResult={importResult}
      busy={busy}
      message={message}
      onReload={reload}
      onImport={importCsv}
      onClearImport={clearImportResult}
      onUpdate={update}
    />
  );
}
