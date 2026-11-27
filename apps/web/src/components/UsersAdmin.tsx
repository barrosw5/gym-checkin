import { useAuthenticatedUser } from "../hooks/useCurrentUser";
import { useUsersAdmin } from "../hooks/useUsersAdmin";
import UsersAdminView from "./UsersAdminView";

/** Accounts: connects the hook (API) to the view. */
export default function UsersAdmin() {
  // UX only: the API refuses changes from demo accounts (NoDemoGuard)
  const { isDemo } = useAuthenticatedUser();
  const { users, failed, importResult, busy, message, reload, importCsv, clearImportResult, update } = useUsersAdmin();

  return (
    <UsersAdminView
      users={users}
      failed={failed}
      importResult={importResult}
      busy={busy}
      message={message}
      readOnly={isDemo}
      onReload={reload}
      onImport={importCsv}
      onClearImport={clearImportResult}
      onUpdate={update}
    />
  );
}
