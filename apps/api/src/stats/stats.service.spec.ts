import { ClosedBy } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { StatsService } from './stats.service.js';

// Wednesday 7 January 2026, 18:30 in Lisbon (UTC+0 in winter)
const NOW = new Date('2026-01-07T18:30:00Z');
const at = (iso: string) => new Date(iso);

describe('StatsService.summary', () => {
  const findMany = vi.fn();
  let service: StatsService;

  beforeEach(() => {
    vi.resetAllMocks();
    findMany.mockResolvedValue([]);
    service = new StatsService({ session: { findMany } } as unknown as PrismaService);
  });

  it('asks only for times of visits that overlap the period, without auto-closed ones', async () => {
    await service.summary('today', NOW);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        entryAt: { lt: at('2026-01-07T18:30:00Z') },
        AND: [
          { OR: [{ exitAt: null }, { exitAt: { gt: at('2026-01-07T00:00:00Z') } }] },
          { OR: [{ closedBy: null }, { closedBy: { not: ClosedBy.AUTO } }] },
        ],
      },
      // GDPR: no user, no id
      select: { entryAt: true, exitAt: true },
    });
  });

  it('returns the period and empty statistics when nobody came', async () => {
    const summary = await service.summary('week', NOW);

    expect(summary).toMatchObject({
      range: 'week',
      from: '2026-01-01T00:00:00.000Z',
      to: '2026-01-07T18:30:00.000Z',
      duration: { visits: 0, averageMinutes: null, medianMinutes: null },
    });
    expect(summary.typicalDay[60]).toBe(0); // 15:00: the gym was empty
    expect(summary.heatmap).toHaveLength(7);
  });

  it('counts a visit that is still open until now', async () => {
    findMany.mockResolvedValue([{ entryAt: at('2026-01-07T18:00:00Z'), exitAt: null }]);

    const { typicalDay, duration } = await service.summary('today', NOW);

    expect(typicalDay[72]).toBe(1); // 18:00-18:15, inside the whole time
    expect(typicalDay[73]).toBe(1); // 18:15-18:30
    expect(typicalDay[74]).toBeNull(); // 18:30 has not happened yet
    expect(duration.visits).toBe(0); // not over: no duration yet
  });

  it('measures only finished visits that started in the period', async () => {
    findMany.mockResolvedValue([
      // Started yesterday, ended today: counts in the occupancy, not in durations
      { entryAt: at('2026-01-06T23:30:00Z'), exitAt: at('2026-01-07T00:30:00Z') },
      { entryAt: at('2026-01-07T10:00:00Z'), exitAt: at('2026-01-07T10:45:00Z') },
    ]);

    const { typicalDay, duration } = await service.summary('today', NOW);

    expect(typicalDay[0]).toBe(1);
    expect(duration).toEqual({ visits: 1, averageMinutes: 45, medianMinutes: 45 });
  });
});
