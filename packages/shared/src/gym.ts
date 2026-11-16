/**
 * Current gym occupancy: GET /api/gym/occupancy and each SSE message of
 * GET /api/gym/stream. Only counts, never who is inside (GDPR).
 */
export interface Occupancy {
  count: number;
  capacity: number;
}
