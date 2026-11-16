import {
  API_PREFIX,
  type SessionCorrection,
  type SessionsQuery,
} from "@gym-checkin/shared";
import type { AdminSessionDto } from "../types/adminSessions";
import { toHttpError } from "./httpError";

const BASE_URL = `/${API_PREFIX}/admin/sessions`;

export const adminSessionsApi = {
  list: async (query: SessionsQuery): Promise<AdminSessionDto[]> => {
    const response = await fetch(`${BASE_URL}?${new URLSearchParams(query)}`);
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },

  correct: async (id: string, body: SessionCorrection): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await toHttpError(response);
  },
};
