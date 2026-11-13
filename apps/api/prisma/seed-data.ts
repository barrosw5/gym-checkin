import { ClosedBy, SessionMethod, type Prisma } from '@prisma/client';

/**
 * Default row of the Settings singleton. The API reads it by this id;
 * there is never more than one row.
 */
export const DEFAULT_SETTINGS = {
  id: 'global',
  capacity: 10,
  autoCloseHours: 2,
  // Only the simple method exists until Phase 3 (QR) and Phase 4 (approval)
  enabledMethods: [SessionMethod.SIMPLE],
  qrWindowSeconds: 30,
} satisfies Prisma.SettingsCreateInput;

const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * MINUTE_MS;

// Rough residence pattern: early morning, lunch and a big evening peak.
// Repeating an hour makes it more likely to be picked.
const ENTRY_HOURS = [7, 7, 8, 12, 13, 17, 18, 18, 19, 19, 19, 20, 20, 21];

export interface FakeSessionOptions {
  userId: string;
  /** Sessions end before this instant, so none of them is still open. */
  now: Date;
  days: number;
  /** Chance (0..1) of a gym visit on any given day. */
  visitProbability: number;
  autoCloseHours: number;
  /** Returns a number in [0, 1). Injected so tests are deterministic. */
  random: () => number;
}

/**
 * Builds closed sessions spread over the past `days` days, for demo data and
 * for testing statistics later (Phase 5).
 *
 * Every session is closed (exitAt set): an open one would collide with the
 * `one_open_session_per_user` index and would show up as "in the gym now".
 * About 1 in 10 is closed by the job (AUTO), like a forgotten checkout.
 */
export function buildFakeSessions(
  opts: FakeSessionOptions,
): Prisma.SessionCreateManyInput[] {
  const { userId, now, days, visitProbability, autoCloseHours, random } = opts;
  const pick = <T>(items: readonly T[]): T =>
    items[Math.floor(random() * items.length)];
  const sessions: Prisma.SessionCreateManyInput[] = [];

  // Start at day 1: today is left empty, so occupancy starts at 0
  for (let daysAgo = days; daysAgo >= 1; daysAgo--) {
    if (random() >= visitProbability) continue;

    const entryAt = new Date(now.getTime() - daysAgo * DAY_MS);
    entryAt.setUTCHours(pick(ENTRY_HOURS), Math.floor(random() * 60), 0, 0);

    const forgotCheckout = random() < 0.1;
    const durationMin = forgotCheckout
      ? autoCloseHours * 60
      : 30 + Math.floor(random() * 61); // 30..90 min

    sessions.push({
      userId,
      entryAt,
      exitAt: new Date(entryAt.getTime() + durationMin * MINUTE_MS),
      method: SessionMethod.SIMPLE,
      closedBy: forgotCheckout ? ClosedBy.AUTO : ClosedBy.USER,
    });
  }
  return sessions;
}

/**
 * Small seeded PRNG (mulberry32): the same seed gives the same sessions on
 * every machine, so the demo data is reproducible. Not for security.
 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
