import { API_PREFIX } from "@gym-checkin/shared";
import type { PendingRequestDto, RequestDecision } from "../types/requests";
import { toHttpError } from "./httpError";

const BASE_URL = `/${API_PREFIX}/admin/requests`;

export const adminRequestsApi = {
  /** SSE: the pending list now and after every change. Returns a closer. */
  openStream: (
    onList: (list: PendingRequestDto[]) => void,
    onError: () => void,
  ): (() => void) => {
    const source = new EventSource(`${BASE_URL}/stream`);
    source.onmessage = (event: MessageEvent<string>) => {
      onList(JSON.parse(event.data) as PendingRequestDto[]);
    };
    source.onerror = onError;
    return () => source.close();
  },

  decide: async (id: string, decision: RequestDecision): Promise<void> => {
    const response = await fetch(
      `${BASE_URL}/${encodeURIComponent(id)}/${decision}`,
      { method: "POST" },
    );
    if (!response.ok) throw await toHttpError(response);
  },
};
