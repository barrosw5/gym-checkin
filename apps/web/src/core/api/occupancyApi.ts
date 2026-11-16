import { API_PREFIX, type Occupancy } from "@gym-checkin/shared";

const STREAM_URL = `/${API_PREFIX}/gym/stream`;

export interface OccupancyStreamHandlers {
  onUpdate: (occupancy: Occupancy) => void;
  /** Connection lost; the browser reconnects on its own. */
  onError: () => void;
}

// Pure transport: opens the SSE connection and parses each message.
// Same origin, so the httpOnly auth cookie is sent automatically.
export const occupancyApi = {
  /** Returns a function that closes the connection. */
  openStream: ({ onUpdate, onError }: OccupancyStreamHandlers): (() => void) => {
    const source = new EventSource(STREAM_URL);
    source.onmessage = (event: MessageEvent<string>) => {
      onUpdate(JSON.parse(event.data) as Occupancy);
    };
    source.onerror = onError;
    return () => source.close();
  },
};
