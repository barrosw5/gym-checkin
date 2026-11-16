import { ClosedBy, SessionMethod, type Prisma } from '@prisma/client';

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
 * for testing statistics later (Phase 6).
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

/** How one fake resident uses the gym. */
export interface DemoHabit {
  /** Local hours they usually arrive at (repeat an hour to favour it). */
  hours: readonly number[];
  /** Chance of a visit on a weekday and on a weekend day. */
  weekday: number;
  weekend: number;
}

/** A few believable residents: the mix makes the morning and evening peaks. */
export const DEMO_HABITS: readonly DemoHabit[] = [
  { hours: [7, 7, 8], weekday: 0.7, weekend: 0.2 }, // before classes
  { hours: [18, 19, 19, 20], weekday: 0.6, weekend: 0.3 }, // after classes
  { hours: [12, 13, 17], weekday: 0.4, weekend: 0.2 }, // lunch or late afternoon
  { hours: [20, 21, 21, 22], weekday: 0.5, weekend: 0.4 }, // night owl
  { hours: [10, 11, 16], weekday: 0.15, weekend: 0.6 }, // mostly weekends
];

export interface DemoVisitOptions {
  /** One habit per fake resident (their ids come from the database). */
  residents: readonly { userId: string; habit: DemoHabit }[];
  /** Visits end before this instant: none is still open. */
  now: Date;
  days: number;
  autoCloseHours: number;
  /** Turns a local calendar day into its local midnight (UTC instant). */
  localMidnight: (year: number, month: number, day: number) => number;
  /** Today's local date. */
  today: { year: number; month: number; day: number };
  random: () => number;
}

/**
 * 90 days of visits for the statistics demo: each resident follows a habit,
 * weekends are quieter and later, about 1 in 20 visits is a forgotten key
 * (closed AUTO). Times are local (Lisbon), so the peaks land on 7-9h and
 * 18-21h in the charts. Only closed visits, and today only up to now.
 */
export function buildDemoVisits(opts: DemoVisitOptions): Prisma.SessionCreateManyInput[] {
  const { residents, now, days, autoCloseHours, localMidnight, today, random } = opts;
  const visits: Prisma.SessionCreateManyInput[] = [];

  for (let daysAgo = days - 1; daysAgo >= 0; daysAgo--) {
    // Calendar arithmetic in UTC (no time zone): only the date matters here
    const date = new Date(Date.UTC(today.year, today.month - 1, today.day - daysAgo));
    const weekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
    const midnight = localMidnight(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());

    for (const { userId, habit } of residents) {
      if (random() >= (weekend ? habit.weekend : habit.weekday)) continue;

      const hour = habit.hours[Math.floor(random() * habit.hours.length)];
      const entryAt = new Date(midnight + (hour * 60 + Math.floor(random() * 60)) * MINUTE_MS);
      const forgotKey = random() < 0.05;
      const minutes = forgotKey ? autoCloseHours * 60 : 25 + Math.floor(random() * 66); // 25-90 min
      const exitAt = new Date(entryAt.getTime() + minutes * MINUTE_MS);
      // Today: only visits already over (an open one would be "in the gym now")
      if (exitAt >= now) continue;

      visits.push({
        userId,
        entryAt,
        exitAt,
        // Mostly the screen QR, some approved by reception
        method: random() < 0.8 ? SessionMethod.SCREEN_QR : SessionMethod.RECEPTION_APPROVAL,
        closedBy: forgotKey ? ClosedBy.AUTO : ClosedBy.USER,
      });
    }
  }
  return visits;
}
