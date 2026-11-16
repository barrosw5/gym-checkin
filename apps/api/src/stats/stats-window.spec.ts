import { describe, expect, it } from 'vitest';
import { statsWindow } from './stats-window.js';

const TZ = 'Europe/Lisbon';
const window = (range: Parameters<typeof statsWindow>[0], now: string) => {
  const { from, to } = statsWindow(range, new Date(now), TZ);
  return { from: from.toISOString(), to: to.toISOString() };
};

describe('statsWindow', () => {
  it('today, in winter (UTC+0): from midnight to now, floored to 15 minutes', () => {
    expect(window('today', '2026-01-07T15:07:30Z')).toEqual({
      from: '2026-01-07T00:00:00.000Z',
      to: '2026-01-07T15:00:00.000Z',
    });
  });

  it('today, in summer (UTC+1): local midnight is 23:00 UTC the day before', () => {
    expect(window('today', '2026-07-08T10:20:00Z').from).toBe('2026-07-07T23:00:00.000Z');
  });

  it('today, just after local midnight while UTC is still on the day before', () => {
    // 23:30 UTC on 7 July is 00:30 on 8 July in Lisbon
    expect(window('today', '2026-07-07T23:30:00Z')).toEqual({
      from: '2026-07-07T23:00:00.000Z',
      to: '2026-07-07T23:30:00.000Z',
    });
  });

  it('week: the last 7 days, today included', () => {
    expect(window('week', '2026-01-07T15:00:00Z').from).toBe('2026-01-01T00:00:00.000Z');
  });

  it('week across the clock change: starts at the local midnight of a winter day', () => {
    // 1 April is summer time; 26 March (7 days back, today included) is winter
    expect(window('week', '2026-04-01T12:00:00Z').from).toBe('2026-03-26T00:00:00.000Z');
  });

  it('month: the last 30 days', () => {
    expect(window('month', '2026-01-30T08:00:00Z').from).toBe('2026-01-01T00:00:00.000Z');
  });

  it('quarter: the last 90 days, across months of different lengths', () => {
    expect(window('quarter', '2026-03-31T12:00:00Z').from).toBe('2026-01-01T00:00:00.000Z');
  });
});
