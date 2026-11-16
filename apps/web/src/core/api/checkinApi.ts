import {
  API_PREFIX,
  type CheckinInput,
  type CheckinMethodName,
} from "@gym-checkin/shared";
import type { MyCheckinRequestDto, OpenSessionDto } from "../types/checkin";
import { toHttpError } from "./httpError";

const BASE_URL = `/${API_PREFIX}`;

// Pure HTTP: no React state, no user-facing messages (that is the service's job)
export const checkinApi = {
  getCurrent: async (): Promise<{ session: OpenSessionDto | null }> => {
    const response = await fetch(`${BASE_URL}/checkin/current`);
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },

  // The shared schema type: the body always matches what the API validates
  checkIn: async (body: CheckinInput): Promise<OpenSessionDto> => {
    const response = await fetch(`${BASE_URL}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },

  getMethods: async (): Promise<{ enabledMethods: CheckinMethodName[] }> => {
    const response = await fetch(`${BASE_URL}/checkin/methods`);
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },

  createRequest: async (): Promise<MyCheckinRequestDto> => {
    const response = await fetch(`${BASE_URL}/checkin/requests`, {
      method: "POST",
    });
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },

  getMyRequest: async (): Promise<{ request: MyCheckinRequestDto | null }> => {
    const response = await fetch(`${BASE_URL}/checkin/requests/current`);
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },

  checkOut: async (): Promise<void> => {
    const response = await fetch(`${BASE_URL}/checkout`, { method: "POST" });
    if (!response.ok) throw await toHttpError(response);
  },
};
