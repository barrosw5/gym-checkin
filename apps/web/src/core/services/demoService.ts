import type { DemoRole } from "@gym-checkin/shared";
import { demoApi } from "../api/demoApi";
import { HttpError } from "../api/httpError";
import { TranslatableError } from "../i18n/types";
import type { OccupancyView } from "../types/occupancy";
import { toOccupancyView } from "./occupancyService";

export const demoService = {
  /**
   * The public demo's live occupancy, or null when there is no demo. A failure
   * also gives null: the login form must work whatever happens to this extra.
   */
  getOccupancy: async (): Promise<OccupancyView | null> => {
    try {
      const status = await demoApi.getStatus();
      return status.enabled ? toOccupancyView(status.occupancy) : null;
    } catch {
      return null;
    }
  },

  login: async (role: DemoRole): Promise<void> => {
    try {
      await demoApi.login(role);
    } catch (err) {
      const key = err instanceof HttpError && err.status === 429 ? "errors.tooManyRequests" : "errors.login.failed";
      throw new TranslatableError(key, undefined, { cause: err });
    }
  },
};
