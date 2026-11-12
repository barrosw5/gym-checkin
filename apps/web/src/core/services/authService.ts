import { loginSchema } from "@gym-checkin/shared";
import { authApi } from "../api/authApi";

export const authService = {
  login: async (username: string, password: string) => {
    // Same schema as the API: instant feedback without a network round trip.
    // UX only; the API validates again, since the client can be bypassed.
    const result = loginSchema.safeParse({ username, password });
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }
    return authApi.login(result.data.username, result.data.password);
  },
  logout: async () => {
    return authApi.logout();
  },
  getProfile: async () => {
    return authApi.getMe();
  },
};
