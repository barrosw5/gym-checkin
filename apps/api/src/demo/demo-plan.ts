import { createHash } from 'node:crypto';
import { ClosedBy, SessionMethod } from '@prisma/client';
import { GYM_TIME_ZONE } from '@gym-checkin/shared';
import { offsetAt } from '../stats/stats-window.js';
import { seededRandom } from './random.js';

const MINUTE_MS = 60_000;
/** Places the demo never takes, so a visitor can still get in. */
const FREE_PLACES = 2;

/** Visits aimed at on each weekday, Sunday first (as Date.getUTCDay). */
const VISITS_PER_DAY = [20, 46, 44, 45, 42, 38, 24];

/** [arrival hour (Lisbon), weight]: morning, lunch and a big evening peak. */
const WEEKDAY_HOURS = [
  [7, 7], [8, 6], [9, 3], [10, 3], [11, 3], [12, 5], [13, 5], [14, 3],
  [15, 3], [16, 4], [17, 7], [18, 10], [19, 10], [20, 9], [21, 7],
] as const;
/** Weekends start later and are spread out. */
const WEEKEND_HOURS = [
  [9, 3], [10, 6], [11, 6], [12, 3], [15, 3], [16, 4], [17, 4], [18, 4], [19, 3],
  [20, 2],
] as const;

export interface DemoMember {
  userId: string;
  username: string;
}

/** One visit of the plan: how it starts and how it will end. */
export interface DemoVisit {
  id: string;
  userId: string;
  entryAt: Date;
  exitAt: Date;
  method: SessionMethod;
  closedBy: ClosedBy;
}

export interface DemoPlanOptions {
  members: readonly DemoMember[];
  now: Date;
  /** How many calendar days to plan, today included. */
  days: number;
  capacity: number;
  autoCloseHours: number;
}

/** A stable UUID: the same day and member always give the same session id. */
function visitId(date: string, username: string): string {
  const h = createHash('sha256').update(`demo:${date}:${username}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function pickHour(hours: readonly (readonly [number, number])[], random: () => number): number {
  let left = random() * hours.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [hour, weight] of hours) {
    left -= weight;
    if (left < 0) return hour;
  }
  return hours[hours.length - 1][0];
}

/**
 * Every visit of one day, decided by the date alone: no state to store, and
 * the same answer after a restart. `day` is a calendar date at UTC midnight.
 */
function planDay(day: Date, options: DemoPlanOptions): DemoVisit[] {
  const { members, capacity, autoCloseHours } = options;
  const date = day.toISOString().slice(0, 10);
  const random = seededRandom(createHash('sha256').update(date).digest().readUInt32BE(0));
  const weekday = day.getUTCDay();
  const hours = weekday === 0 || weekday === 6 ? WEEKEND_HOURS : WEEKDAY_HOURS;

  // Shuffle (Fisher-Yates) from a fixed order, then take the first N: each
  // member comes at most once a day, so their visits never overlap
  const pool = [...members].sort((a, b) => a.username.localeCompare(b.username));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const wanted = Math.round(VISITS_PER_DAY[weekday] * (0.85 + random() * 0.3));

  const candidates = pool.slice(0, wanted).map((member) => {
    const minute = pickHour(hours, random) * 60 + Math.floor(random() * 60);
    const wallClock = day.getTime() + minute * MINUTE_MS;
    // The offset of that moment, not of midnight: right on daylight saving days
    const entry = wallClock - offsetAt(wallClock, GYM_TIME_ZONE);
    const forgotKey = random() < 0.04;
    const minutes = forgotKey ? autoCloseHours * 60 : 45 + Math.floor(random() * 66); // 45-110 min
    return {
      id: visitId(date, member.username),
      userId: member.userId,
      entryAt: new Date(entry),
      exitAt: new Date(entry + minutes * MINUTE_MS),
      // Mostly the screen QR, some approved by reception
      method: random() < 0.8 ? SessionMethod.SCREEN_QR : SessionMethod.RECEPTION_APPROVAL,
      closedBy: forgotKey ? ClosedBy.AUTO : ClosedBy.USER,
    };
  });

  // Walk the day in order and drop whoever would find the gym "full"
  const limit = Math.max(1, capacity - FREE_PLACES);
  const accepted: DemoVisit[] = [];
  for (const visit of candidates.sort((a, b) => a.entryAt.getTime() - b.entryAt.getTime())) {
    const inside = accepted.filter((v) => v.exitAt > visit.entryAt).length;
    if (inside < limit) accepted.push(visit);
  }
  return accepted;
}

/** The visits that have started by `now`, over the last `days` days (Lisbon). */
export function planDemoVisits(options: DemoPlanOptions): DemoVisit[] {
  const { now, days } = options;
  // Today's date on the gym's clock, kept as a UTC date for calendar maths
  const local = new Date(now.getTime() + offsetAt(now.getTime(), GYM_TIME_ZONE));
  const visits: DemoVisit[] = [];
  for (let daysAgo = days - 1; daysAgo >= 0; daysAgo--) {
    const day = new Date(
      Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - daysAgo),
    );
    visits.push(...planDay(day, options).filter((v) => v.entryAt <= now));
  }
  return visits;
}
