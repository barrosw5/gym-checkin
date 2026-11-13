import { describe, expect, it } from 'vitest';
import {
  buildFakeSessions,
  seededRandom,
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
