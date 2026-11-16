import type { UserUpdate } from "@gym-checkin/shared";
import { adminUsersApi } from "../api/adminUsersApi";
import { HttpError } from "../api/httpError";
import type { AdminUser, ImportError, ImportResult } from "../types/adminUsers";

const isImportErrors = (value: unknown): value is ImportError[] =>
  Array.isArray(value) &&
  value.every((e) => typeof e?.line === "number" && typeof e?.message === "string");

function errorMessage(err: unknown): string {
  if (err instanceof HttpError) {
    if (err.message === "You cannot deactivate your own account") {
      return "Não podes desativar a tua própria conta.";
    }
    if (err.status === 409) return "Um username foi criado entretanto. Tenta outra vez.";
  }
  return "Não foi possível concluir. Tenta outra vez.";
}

export const usersAdminService = {
  list: (): Promise<AdminUser[]> => adminUsersApi.list(),

  /**
   * A 400 with per-line errors is an expected outcome (fix the file), not a
   * failure: it comes back as data so the page can list every line.
   */
  importCsv: async (csv: string): Promise<ImportResult> => {
    try {
      return { ok: true, ...(await adminUsersApi.importCsv(csv)) };
    } catch (err) {
      if (err instanceof HttpError && err.status === 400 && isImportErrors(err.errors)) {
        return { ok: false, errors: err.errors };
      }
      throw new Error(errorMessage(err), { cause: err });
    }
  },

  update: async (id: string, body: UserUpdate): Promise<AdminUser> => {
    try {
      return await adminUsersApi.update(id, body);
    } catch (err) {
      throw new Error(errorMessage(err), { cause: err });
    }
  },
};
