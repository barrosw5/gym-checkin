import { API_PREFIX, type ChangePasswordInput } from "@gym-checkin/shared";
import type { User } from "../types/user";
import { toHttpError } from "./httpError";

// Same prefix as the API's global prefix (single source in the shared package)
const AUTH_URL = `/${API_PREFIX}/auth`;

// Every non-2xx response becomes an HttpError with its status code:
// this layer reports what happened, the service layer decides what it means
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${AUTH_URL}/logout`, { method: "POST" });
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },

  changePassword: async (body: ChangePasswordInput): Promise<void> => {
    const response = await fetch(`${AUTH_URL}/password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await toHttpError(response);
  },

  getMe: async (): Promise<User> => {
    const response = await fetch(`${AUTH_URL}/me`);
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },
};
