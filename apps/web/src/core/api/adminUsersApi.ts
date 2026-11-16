import { API_PREFIX, type UserUpdate } from "@gym-checkin/shared";
import type { AdminUser, ImportedAccount } from "../types/adminUsers";
import { toHttpError } from "./httpError";

const BASE_URL = `/${API_PREFIX}/admin/users`;

export const adminUsersApi = {
  list: async (): Promise<AdminUser[]> => {
    const response = await fetch(BASE_URL);
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },

  importCsv: async (csv: string): Promise<{ created: ImportedAccount[] }> => {
    const response = await fetch(`${BASE_URL}/import`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },

  update: async (id: string, body: UserUpdate): Promise<AdminUser> => {
    const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },
};
