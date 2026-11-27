import { ClosedBy } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { DEMO_MEMBERS } from './demo-members.js';
import { type DemoPlanOptions, type DemoVisit, planDemoVisits } from './demo-plan.js';

// Friday 27 November 2026, 23:59 in Lisbon (winter: same as UTC)
const END_OF_DAY = new Date('2026-11-27T23:59:00Z');
const members = DEMO_MEMBERS.map(([username], i) => ({ userId: `u${i}`, username }));

const plan = (overrides: Partial<DemoPlanOptions> = {}) =>
  planDemoVisits({
    members,
    now: END_OF_DAY,
    days: 90,
    capacity: 10,
    autoCloseHours: 2,
    ...overrides,
  });

const dayOf = (v: DemoVisit) => v.entryAt.toISOString().slice(0, 10);

/** The most people inside at once: walk entries (+1) and exits (-1) in time order. */
function peak(visits: DemoVisit[]): number {
  const changes = visits
    .flatMap((v) => [
      [v.entryAt.getTime(), 1],
      [v.exitAt.getTime(), -1],
    ])
    // At the same instant, whoever leaves is counted out first
    .sort(([a, x], [b, y]) => a - b || x - y);
  let inside = 0;
  let most = 0;
  for (const [, change] of changes) {
    inside += change;
    most = Math.max(most, inside);
  }
  return most;
}

describe('planDemoVisits', () => {
  it('gives the same plan every time (a restart changes nothing)', () => {
    expect(plan()).toEqual(plan());
  });

  it('does not depend on the order the members arrive from the database', () => {
    expect(plan({ members: [...members].reverse(), days: 3 })).toEqual(plan({ days: 3 }));
  });

  it('keeps a day identical whatever the length of the period', () => {
    const today = (v: DemoVisit) => dayOf(v) === '2026-11-27';
    expect(plan({ days: 2 }).filter(today)).toEqual(plan().filter(today));
  });

  it('covers the whole period, today included', () => {
    const days = new Set(plan().map(dayOf));

    expect(days.size).toBe(90);
    expect(days.has('2026-08-30')).toBe(true); // 89 days before 27 November
    expect(days.has('2026-11-27')).toBe(true);
  });

  it('has only visits that already started', () => {
    const now = new Date('2026-11-27T18:30:00Z');

    for (const v of plan({ now })) expect(v.entryAt.getTime()).toBeLessThanOrEqual(now.getTime());
  });

  it('has people inside at the evening peak', () => {
    const now = new Date('2026-11-26T19:15:00Z'); // a Thursday
    const inside = plan({ now }).filter((v) => v.exitAt > now);

    expect(inside.length).toBeGreaterThanOrEqual(4);
  });

  it('always leaves two places free for visitors', () => {
    expect(peak(plan())).toBeLessThanOrEqual(8);
    expect(peak(plan({ capacity: 5 }))).toBeLessThanOrEqual(3);
    expect(peak(plan({ capacity: 1 }))).toBe(1);
  });

  it('never brings a member twice on the same day, and ids are unique', () => {
    const visits = plan();

    expect(new Set(visits.map((v) => `${dayOf(v)} ${v.userId}`)).size).toBe(visits.length);
    expect(new Set(visits.map((v) => v.id)).size).toBe(visits.length);
  });

  it('uses ids the admin endpoints accept (UUID)', () => {
    for (const v of plan({ days: 1 })) {
      expect(v.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
    }
  });

  it('keeps visits between 07:00 and midnight, on Lisbon time', () => {
    // 29 March 2026 changes to summer time (UTC+1): 07:00 Lisbon = 06:00 UTC
    for (const now of [END_OF_DAY, new Date('2026-04-02T22:59:00Z')]) {
      const clock = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Lisbon',
        hour: '2-digit',
        hourCycle: 'h23',
      });
      for (const v of plan({ now, days: 7 })) {
        expect(Number(clock.format(v.entryAt))).toBeGreaterThanOrEqual(7);
        expect(Number(clock.format(v.entryAt))).toBeLessThanOrEqual(21);
        expect(clock.format(v.exitAt)).not.toBe('00');
      }
    }
  });

  it('is busier on weekdays than on weekends', () => {
    const visits = plan();
    const weekend = visits.filter((v) => [0, 6].includes(v.entryAt.getUTCDay())).length;

    // 90 days hold about 26 weekend days and 64 weekdays
    expect(weekend / 26).toBeLessThan((visits.length - weekend) / 64);
  });

  it('forgets a few keys (AUTO, closed at the limit), never most of them', () => {
    const visits = plan();
    const auto = visits.filter((v) => v.closedBy === ClosedBy.AUTO);

    expect(auto.length).toBeGreaterThan(0);
    expect(auto.length / visits.length).toBeLessThan(0.1);
    for (const v of auto) expect(v.exitAt.getTime() - v.entryAt.getTime()).toBe(2 * 60 * 60_000);
  });

  it('plans nothing without members', () => {
    expect(plan({ members: [] })).toEqual([]);
  });
});
