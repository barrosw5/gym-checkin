import { useCallback, useEffect, useState } from "react";
import { usersAdminService } from "../core/services/usersAdminService";
import type { AdminUser, ImportResult } from "../core/types/adminUsers";

/** Admin page: residents' accounts and the CSV import. */
export const useUsersAdmin = () => {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const reload = useCallback(async () => {
    try {
      setUsers(await usersAdminService.list());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    // Ignore the answer if the page closed meanwhile
    let cancelled = false;
    usersAdminService
      .list()
      .then((list) => !cancelled && setUsers(list))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setBusy(false);
    }
  };

  return {
    users,
    failed,
    importResult,
    busy,
    message,
    reload,
    importCsv: (csv: string) =>
      run(async () => {
        const result = await usersAdminService.importCsv(csv);
        setImportResult(result);
        if (result.ok) await reload();
      }),
    /** Forget the temporary passwords once the admin has copied them. */
    clearImportResult: () => setImportResult(null),
    update: (id: string, body: { active?: boolean; room?: string }) =>
      run(async () => {
        const updated = await usersAdminService.update(id, body);
        setUsers((list) => list?.map((u) => (u.id === id ? updated : u)) ?? null);
      }),
  };
};
