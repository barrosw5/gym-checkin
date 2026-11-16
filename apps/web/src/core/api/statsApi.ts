import { API_PREFIX, type StatsRange, type StatsSummary } from "@gym-checkin/shared";
import { toHttpError } from "./httpError";

const BASE_URL = `/${API_PREFIX}/stats`;

// Pure transport: same origin, so the httpOnly auth cookie goes along
export const statsApi = {
  summary: async (range: StatsRange): Promise<StatsSummary> => {
    const response = await fetch(`${BASE_URL}/summary?${new URLSearchParams({ range })}`);
    if (!response.ok) throw await toHttpError(response);
    return response.json();
  },
};
