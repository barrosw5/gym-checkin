import {
  MIN_PASSWORD_LENGTH,
  changePasswordSchema,
  loginSchema,
} from "@gym-checkin/shared";
import { authApi } from "../api/authApi";
import { HttpError } from "../api/httpError";
import { TranslatableError, type MessageKey, type MessageParams } from "../i18n/types";
import type { Role, User } from "../types/user";

/** Each role's home: students train, staff run the gym (no check-in). */
const HOME_BY_ROLE: Record<Role, string> = {
  STUDENT: "/dashboard",
  RECEPTION: "/reception",
  // The admin starts at the desk too; accounts are one click away
  ADMIN: "/reception",
};

export const homePathFor = (role: Role): string => HOME_BY_ROLE[role];

/** Turns a failed login into a message the user can act on. */
function loginError(err: unknown): TranslatableError {
  if (err instanceof HttpError && err.status === 401) {
    return new TranslatableError("errors.login.invalid", undefined, { cause: err });
  }
  if (err instanceof HttpError && err.status === 429) {
    return err.retryAfter
      ? new TranslatableError("errors.login.tooManyIn", { seconds: err.retryAfter }, { cause: err })
      : new TranslatableError("errors.login.tooManySoon", undefined, { cause: err });
  }
  return new TranslatableError("errors.login.failed", undefined, { cause: err });
}

// The shared schemas' messages (English, stable) mapped to message keys
const LOGIN_RULES: Record<string, MessageKey> = {
  "Username is required": "errors.login.usernameRequired",
  "Password is required": "errors.login.passwordRequired",
  "Password is too long": "errors.login.passwordTooLong",
};

/** Turns a refused password change into a message the user can act on. */
function changePasswordErrorKey(err: unknown): MessageKey {
  if (err instanceof HttpError) {
    if (err.message === "Current password is incorrect") return "errors.password.currentWrong";
    if (err.message === "Demo accounts cannot change their password") return "errors.password.demo";
    if (err.status === 429) return "errors.password.tooMany";
  }
  return "errors.password.failed";
}

const PASSWORD_RULES: Record<string, [MessageKey, MessageParams?]> = {
  "Current password is required": ["errors.password.currentRequired"],
  [`At least ${MIN_PASSWORD_LENGTH} characters`]: ["errors.password.minLength", { min: MIN_PASSWORD_LENGTH }],
  "Password is too long": ["errors.password.tooLong"],
  "The new password must be different": ["errors.password.sameAsCurrent"],
};

export const authService = {
  login: async (username: string, password: string) => {
    // Same schema as the API: instant feedback without a network round trip.
    // UX only; the API validates again, since the client can be bypassed.
    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      throw new TranslatableError(LOGIN_RULES[result.error.issues[0].message] ?? "errors.login.failed");
    }
    try {
      return await authApi.login(result.data.username, result.data.password);
    } catch (err) {
      throw loginError(err);
    }
  },
  /** Same schema as the API: instant feedback (UX); the API checks again. */
  changePassword: async (currentPassword: string, newPassword: string) => {
    const result = changePasswordSchema.safeParse({ currentPassword, newPassword });
    if (!result.success) {
      const [key, params] = PASSWORD_RULES[result.error.issues[0].message] ?? ["errors.password.failed"];
      throw new TranslatableError(key, params);
    }
    try {
      await authApi.changePassword(result.data);
    } catch (err) {
      throw new TranslatableError(changePasswordErrorKey(err), undefined, { cause: err });
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
