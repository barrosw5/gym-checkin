import type { User } from "../types/user";

export const authApi = {
  login: async (username: string, password: string) => {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) throw new Error("Invalid credentials");
    return response.json();
  },

  logout: async () => {
    const response = await fetch("/auth/logout", { method: "POST" });
    if (!response.ok) throw new Error("Logout failed");
    return response.json();
  },

  getMe: async (): Promise<User> => {
    const response = await fetch("/auth/me");
    if (!response.ok) throw new Error("Not authenticated");
    return response.json();
  },
};
