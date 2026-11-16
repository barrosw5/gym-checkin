import { describe, expect, it } from 'vitest';
import { ClosedBy } from '@prisma/client';
import {
  DEMO_HABITS,
  buildDemoVisits,
  buildFakeSessions,
  seededRandom,
  type DemoVisitOptions,
  type FakeSessionOptions,
} from './seed-data.js';

const NOW = new Date('2026-11-13T15:00:00Z');
const DAY_MS = 24 * 60 * 60_000;

const options = (
  overrides: Partial<FakeSessionOptions> = {},
): FakeSessionOptions => ({
  userId: 'u1',
  now: NOW,
  days: 28,
  visitProbability: 0.6,
  autoCloseHours: 2,
  random: seededRandom(42),
  ...overrides,
});

describe('buildFakeSessions', () => {
  it('creates only closed sessions (respects one_open_session_per_user)', () => {
    const sessions = buildFakeSessions(options());

    expect(sessions.length).toBeGreaterThan(0);
    for (const s of sessions) {
      expect(s.exitAt).toBeInstanceOf(Date);
      expect(s.closedBy).toBeDefined();
    }
  });

  it('never creates sessions in the future or today', () => {
    const sessions = buildFakeSessions(options());
    const startOfToday = new Date(NOW);
    startOfToday.setUTCHours(0, 0, 0, 0);

    for (const s of sessions) {
      expect((s.exitAt as Date).getTime()).toBeLessThan(startOfToday.getTime());
    }
  });

  it('keeps every session inside the requested window', () => {
    const sessions = buildFakeSessions(options({ days: 7 }));
    const windowStart = NOW.getTime() - 8 * DAY_MS;

    for (const s of sessions) {
      expect((s.entryAt as Date).getTime()).toBeGreaterThan(windowStart);
    }
  });

  it('has at most one session per day, so they never overlap', () => {
    const sessions = buildFakeSessions(options({ visitProbability: 1 }));
    const days = sessions.map((s) =>
      (s.entryAt as Date).toISOString().slice(0, 10),
    );

    expect(sessions).toHaveLength(28);
    expect(new Set(days).size).toBe(days.length);
  });

  it('closes forgotten sessions as AUTO after exactly autoCloseHours', () => {
    const sessions = buildFakeSessions(
      options({ visitProbability: 1, days: 200 }),
    );
    const auto = sessions.filter((s) => s.closedBy === 'AUTO');

    expect(auto.length).toBeGreaterThan(0);
    for (const s of auto) {
      const duration =
        (s.exitAt as Date).getTime() - (s.entryAt as Date).getTime();
      expect(duration).toBe(2 * 60 * 60_000);
    }
  });

  it('gives user-closed sessions a 30 to 90 minute duration', () => {
    const sessions = buildFakeSessions(
      options({ visitProbability: 1, days: 200 }),
    );

    for (const s of sessions.filter((x) => x.closedBy === 'USER')) {
      const minutes =
        ((s.exitAt as Date).getTime() - (s.entryAt as Date).getTime()) / 60_000;
      expect(minutes).toBeGreaterThanOrEqual(30);
      expect(minutes).toBeLessThanOrEqual(90);
    }
  });

  it('creates nothing when the visit probability is 0', () => {
    expect(buildFakeSessions(options({ visitProbability: 0 }))).toEqual([]);
  });

  it('is deterministic for the same seed', () => {
    expect(buildFakeSessions(options({ random: seededRandom(7) }))).toEqual(
      buildFakeSessions(options({ random: seededRandom(7) })),
    );
  });
});

describe('seededRandom', () => {
  it('returns numbers in [0, 1)', () => {
    const random = seededRandom(1);
    for (let i = 0; i < 1000; i++) {
      const n = random();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });
});

describe('buildDemoVisits', () => {
  // Wednesday 7 January 2026, 18:30 in Lisbon (UTC+0, so local midnight = UTC midnight)
  const now = new Date('2026-01-07T18:30:00Z');
  const demo = (overrides: Partial<DemoVisitOptions> = {}) =>
    buildDemoVisits({
      residents: DEMO_HABITS.map((habit, i) => ({ userId: `r${i}`, habit })),
      now,
      days: 90,
      autoCloseHours: 2,
      localMidnight: (y, m, d) => Date.UTC(y, m - 1, d),
      today: { year: 2026, month: 1, day: 7 },
      random: seededRandom(7),
      ...overrides,
    });

  it('creates only visits that are already over', () => {
    const visits = demo();

    expect(visits.length).toBeGreaterThan(90); // at least one a day on average
    for (const v of visits) expect((v.exitAt as Date).getTime()).toBeLessThan(now.getTime());
  });

  it('covers the whole period, from 89 days ago to today', () => {
    const days = new Set(demo().map((v) => (v.entryAt as Date).toISOString().slice(0, 10)));

    expect(days.has('2025-10-10')).toBe(true); // 89 days before 7 January
    expect(days.has('2025-10-09')).toBe(false);
    expect(days.has('2026-01-07')).toBe(true);
  });

  it('is busier on weekdays than on weekends', () => {
    const visits = demo();
    const weekend = visits.filter((v) => [0, 6].includes((v.entryAt as Date).getUTCDay())).length;
    // Per day: 2 weekend days against 5 weekdays
    expect(weekend / 2).toBeLessThan((visits.length - weekend) / 5);
  });

  it('marks a few visits as forgotten keys (AUTO), never most of them', () => {
    const visits = demo();
    const auto = visits.filter((v) => v.closedBy === ClosedBy.AUTO).length;

    expect(auto).toBeGreaterThan(0);
    expect(auto / visits.length).toBeLessThan(0.1);
  });

  it('gives the same visits for the same seed (reproducible demo)', () => {
    expect(demo()).toEqual(demo());
  });
});
