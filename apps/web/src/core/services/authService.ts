import { loginSchema } from "@gym-checkin/shared";
import { authApi } from "../api/authApi";
import { HttpError } from "../api/httpError";
import type { User } from "../types/user";

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
