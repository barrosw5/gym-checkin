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

/** A problem in one line of the file (0 = the whole file). */
export interface ImportError {
  line: number;
  message: string;
}

export type ImportResult =
  | { ok: true; created: ImportedAccount[] }
  | { ok: false; errors: ImportError[] };
