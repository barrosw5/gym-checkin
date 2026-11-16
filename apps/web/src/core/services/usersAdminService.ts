import type { UserUpdate } from "@gym-checkin/shared";
import { adminUsersApi } from "../api/adminUsersApi";
import { HttpError } from "../api/httpError";
import { TranslatableError, type MessageKey, type Translatable } from "../i18n/types";
import type { AdminUser, ImportErrorDto, ImportResult } from "../types/adminUsers";

const isImportErrors = (value: unknown): value is ImportErrorDto[] =>
  Array.isArray(value) &&
  value.every((e) => typeof e?.line === "number" && typeof e?.message === "string");

// The API's per-line import messages (English, stable) mapped to message
// keys. Unknown messages are still shown (as-is) rather than hidden.
const IMPORT_MESSAGES: [RegExp, (m: RegExpMatchArray) => Translatable][] = [
  [/^Expected 3 columns/, () => ({ key: "errors.import.columns" })],
  [/^Name is required$/, () => ({ key: "errors.import.nameRequired" })],
  [/^Room is required$/, () => ({ key: "errors.import.roomRequired" })],
  [/^Username: /, () => ({ key: "errors.import.username" })],
  [
    /^Username "(.+)" repeats line (\d+)$/,
    (m) => ({ key: "errors.import.repeats", params: { username: m[1], line: m[2] } }),
  ],
  [/^Username "(.+)" already exists$/, (m) => ({ key: "errors.import.exists", params: { username: m[1] } })],
  [/^At most (\d+) users per import$/, (m) => ({ key: "errors.import.maxRows", params: { max: m[1] } })],
  [/^No users in the file$/, () => ({ key: "errors.import.empty" })],
];

/** One line may carry several messages joined by "; " (zod issues). */
const toImportMessages = (message: string): Translatable[] =>
  message.split("; ").map((part) => {
    for (const [pattern, toMessage] of IMPORT_MESSAGES) {
      const match = part.match(pattern);
      if (match) return toMessage(match);
    }
    return { key: "errors.import.other", params: { message: part } };
  });

function errorKey(err: unknown): MessageKey {
  if (err instanceof HttpError) {
    if (err.message === "You cannot deactivate your own account") {
      return "errors.users.cannotDeactivateSelf";
    }
    if (err.status === 409) return "errors.users.usernameTaken";
  }
  return "errors.unexpected";
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
          errors: err.errors.map((e) => ({ line: e.line, messages: toImportMessages(e.message) })),
        };
      }
      throw new TranslatableError(errorKey(err), undefined, { cause: err });
    }
  },

  update: async (id: string, body: UserUpdate): Promise<AdminUser> => {
    try {
      return await adminUsersApi.update(id, body);
    } catch (err) {
      throw new TranslatableError(errorKey(err), undefined, { cause: err });
    }
  },
};
