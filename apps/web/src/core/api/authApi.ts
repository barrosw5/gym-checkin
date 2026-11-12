import { API_PREFIX } from "@gym-checkin/shared";
import type { User } from "../types/user";

// Same prefix as the API's global prefix (single source in the shared package)
const AUTH_URL = `/${API_PREFIX}/auth`;

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${AUTH_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error("Invalid credentials");
    return response.json();
  },

  logout: async () => {
    const response = await fetch(`${AUTH_URL}/logout`, { method: "POST" });
    if (!response.ok) throw new Error("Logout failed");
    return response.json();
  },

  getMe: async (): Promise<User> => {
    const response = await fetch(`${AUTH_URL}/me`);
    if (!response.ok) throw new Error("Not authenticated");
    return response.json();
  },
};
