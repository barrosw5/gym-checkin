import { API_PREFIX, type DemoRole, type DemoStatus } from "@gym-checkin/shared";
import { toHttpError } from "./httpError";

const BASE_URL = `/${API_PREFIX}/demo`;

export const demoApi = {
  getStatus: async (): Promise<DemoStatus> => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },

  login: async (role: DemoRole): Promise<void> => {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw await toHttpError(response);
  },
};
