import { API_PREFIX } from "@gym-checkin/shared";
import type { QrTokenDto } from "../types/qr";
import { toHttpError } from "./httpError";

export const qrApi = {
  /** Reception/admin only. The API answers no-store, so it is never cached. */
  getCurrent: async (): Promise<QrTokenDto> => {
    const response = await fetch(`/${API_PREFIX}/admin/qr/current`);
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },
};
