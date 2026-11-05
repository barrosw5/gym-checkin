import { authApi } from "../api/authApi";

export const authService = {
  login: async (username: string, password: string) => {
    const cleanUsername = username.trim();
    return authApi.login(cleanUsername, password);
  },
  logout: async () => {
    return authApi.logout();
  },
  getProfile: async () => {
    return authApi.getMe();
  },
};
