import type { Translatable } from "../i18n/types";
import type { Role } from "./user";

// Mirrors the API's user as the admin sees it (no password hash, ever)
export interface AdminUser {
  id: string;
  name: string;
  room: string;
  username: string;
  role: Role;
  active: boolean;
}

/** A created account: the temporary password is shown once, never stored. */
export interface ImportedAccount {
  name: string;
  username: string;
  temporaryPassword: string;
}

/** A problem in one line of the file, as the API sends it (0 = the whole file). */
export interface ImportErrorDto {
  line: number;
  message: string;
}

/** The same problem, ready to show in the user's language. */
export interface ImportError {
  line: number;
  messages: Translatable[];
}

export type ImportResult =
  | { ok: true; created: ImportedAccount[] }
  | { ok: false; errors: ImportError[] };
