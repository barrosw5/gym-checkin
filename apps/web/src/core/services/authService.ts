import {
  MIN_PASSWORD_LENGTH,
  changePasswordSchema,
  loginSchema,
} from "@gym-checkin/shared";
import { authApi } from "../api/authApi";
import { HttpError } from "../api/httpError";
import type { Role, User } from "../types/user";

/** Each role's home: students train, staff run the gym (no check-in). */
const HOME_BY_ROLE: Record<Role, string> = {
  STUDENT: "/dashboard",
  RECEPTION: "/reception",
  ADMIN: "/admin",
};

export const homePathFor = (role: Role): string => HOME_BY_ROLE[role];

/** Turns a failed login into a message the user can act on. */
function loginErrorMessage(err: unknown): string {
  if (err instanceof HttpError) {
    if (err.status === 401) return "Username ou password incorretos.";
    if (err.status === 429) {
      const wait = err.retryAfter ? ` daqui a ${err.retryAfter} s` : " daqui a pouco";
      return `Demasiadas tentativas. Tenta outra vez${wait}.`;
    }
  }
  return "Não foi possível entrar. Tenta outra vez.";
}

/** Turns a refused password change into a message the user can act on. */
function changePasswordErrorMessage(err: unknown): string {
  if (err instanceof HttpError) {
    if (err.message === "Current password is incorrect") return "A password atual está errada.";
    if (err.message === "Demo accounts cannot change their password") {
      return "As contas de demonstração não podem mudar a password.";
    }
    if (err.status === 429) return "Demasiadas tentativas. Espera um minuto.";
  }
  return "Não foi possível mudar a password. Tenta outra vez.";
}

// The shared schema's checks, in the language the user reads
const PASSWORD_RULE_MESSAGES: Record<string, string> = {
  "Current password is required": "Escreve a password atual.",
  [`At least ${MIN_PASSWORD_LENGTH} characters`]: `A nova password tem de ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
  "Password is too long": "A nova password é demasiado longa.",
  "The new password must be different": "A nova password tem de ser diferente da atual.",
};

export const authService = {
  login: async (username: string, password: string) => {
    // Same schema as the API: instant feedback without a network round trip.
    // UX only; the API validates again, since the client can be bypassed.
    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    try {
      return await authApi.login(result.data.username, result.data.password);
    } catch (err) {
      throw new Error(loginErrorMessage(err), { cause: err });
    }
  },
  /** Same schema as the API: instant feedback (UX); the API checks again. */
  changePassword: async (currentPassword: string, newPassword: string) => {
    const result = changePasswordSchema.safeParse({ currentPassword, newPassword });
    if (!result.success) {
      const message = result.error.issues[0].message;
      throw new Error(PASSWORD_RULE_MESSAGES[message] ?? message);
    }
    try {
      await authApi.changePassword(result.data);
    } catch (err) {
      throw new Error(changePasswordErrorMessage(err), { cause: err });
    }
  },
  logout: async () => {
    return authApi.logout();
  },
  /**
   * The logged-in user, or null when there is no valid session (401).
   * Other failures (network, 500) still throw: "logged out" and "server down"
   * are different situations and must not both send the user to /login.
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      return await authApi.getMe();
    } catch (err) {
      if (err instanceof HttpError && err.status === 401) return null;
      throw err;
    }
  },
};
