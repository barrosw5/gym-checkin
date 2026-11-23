import { useCallback, useEffect, useState } from "react";
import { usersAdminService } from "../core/services/usersAdminService";
import type { AdminUser, ImportResult } from "../core/types/adminUsers";
import { toTranslatable, type Translatable } from "../core/i18n/types";

/** Admin page: members' accounts and the CSV import. */
export const useUsersAdmin = () => {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Translatable | null>(null);

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
    setMessage(null);
    try {
      await action();
    } catch (err) {
      setMessage(toTranslatable(err));
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
