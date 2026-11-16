import type { UserUpdate } from "@gym-checkin/shared";
import { adminUsersApi } from "../api/adminUsersApi";
import { HttpError } from "../api/httpError";
import type { AdminUser, ImportError, ImportResult } from "../types/adminUsers";

const isImportErrors = (value: unknown): value is ImportError[] =>
  Array.isArray(value) &&
  value.every((e) => typeof e?.line === "number" && typeof e?.message === "string");

// The API's per-line import messages, in the language the admin reads.
// Unknown messages pass through unchanged rather than being hidden.
const IMPORT_MESSAGES: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/^Expected 3 columns/, () => "Tem de ter 3 colunas: nome;quarto;username"],
  [/^Name is required$/, () => "Falta o nome"],
  [/^Room is required$/, () => "Falta o quarto"],
  [/^Username: /, () => "Username com 3 a 30 caracteres: letras minúsculas, números, . _ -"],
  [/^Username "(.+)" repeats line (\d+)$/, (m) => `O username "${m[1]}" repete a linha ${m[2]}`],
  [/^Username "(.+)" already exists$/, (m) => `O username "${m[1]}" já existe`],
  [/^At most (\d+) users per import$/, (m) => `No máximo ${m[1]} utilizadores por importação`],
  [/^No users in the file$/, () => "O ficheiro não tem utilizadores"],
];

/** One line may carry several messages joined by "; " (zod issues). */
const translateImportMessage = (message: string): string =>
  message
    .split("; ")
    .map((part) => {
      for (const [pattern, translate] of IMPORT_MESSAGES) {
        const match = part.match(pattern);
        if (match) return translate(match);
      }
      return part;
    })
    .join("; ");

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
        return {
          ok: false,
          errors: err.errors.map((e) => ({ ...e, message: translateImportMessage(e.message) })),
        };
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
