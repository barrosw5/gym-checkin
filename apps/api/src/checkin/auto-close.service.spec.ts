import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OccupancyService } from '../gym/occupancy.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { SettingsService } from '../settings/settings.service.js';
import {
  AUTO_CLOSE_INTERVAL_MS,
  AutoCloseService,
} from './auto-close.service.js';

const NOW = new Date('2026-11-16T20:00:00Z');

describe('AutoCloseService', () => {
  const findMany = vi.fn();
  const updateMany = vi.fn();
  // $transaction([...]) just resolves the list of updateMany results here
  const $transaction = vi.fn((ops: Promise<unknown>[]) => Promise.all(ops));
  const getSettings = vi.fn();
  const notifyChanged = vi.fn();
  let service: AutoCloseService;

  beforeEach(() => {
    vi.clearAllMocks();
    getSettings.mockResolvedValue({ autoCloseHours: 2 });
    findMany.mockResolvedValue([]);
    updateMany.mockResolvedValue({ count: 1 });
    service = new AutoCloseService(
      { session: { findMany, updateMany }, $transaction } as unknown as PrismaService,
      { get: getSettings } as unknown as SettingsService,
      { notifyChanged } as unknown as OccupancyService,
    );
  });

  afterEach(() => {
    service.onApplicationShutdown();
    vi.useRealTimers();
  });

  it('looks only for open sessions older than autoCloseHours', async () => {
    await service.closeStaleSessions(NOW);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          exitAt: null,
          entryAt: { lte: new Date('2026-11-16T18:00:00Z') },
        },
      }),
    );
  });

  it('closes them as AUTO at entry + limit (not "now"), only if still open', async () => {
    const entryAt = new Date('2026-11-16T15:00:00Z');
    findMany.mockResolvedValue([{ id: 's1', entryAt }]);

    await expect(service.closeStaleSessions(NOW)).resolves.toBe(1);

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 's1', exitAt: null },
      data: { exitAt: new Date('2026-11-16T17:00:00Z'), closedBy: 'AUTO' },
    });
    expect(notifyChanged).toHaveBeenCalledOnce();
  });

  it('does nothing (and notifies no one) when no session is stale', async () => {
    await expect(service.closeStaleSessions(NOW)).resolves.toBe(0);

    expect(updateMany).not.toHaveBeenCalled();
    expect(notifyChanged).not.toHaveBeenCalled();
  });

  it('does not notify when the user checked out in the meantime', async () => {
    findMany.mockResolvedValue([{ id: 's1', entryAt: new Date(0) }]);
    updateMany.mockResolvedValue({ count: 0 });

    await expect(service.closeStaleSessions(NOW)).resolves.toBe(0);
    expect(notifyChanged).not.toHaveBeenCalled();
  });

  it('never throws: a failed run is logged and retried on the next tick', async () => {
    getSettings.mockRejectedValue(new Error('connection lost'));
    vi.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

    await expect(service.closeStaleSessions(NOW)).resolves.toBe(0);
  });

  it('runs on startup and then every interval, until shutdown', async () => {
    vi.useFakeTimers();
    const run = vi.spyOn(service, 'closeStaleSessions').mockResolvedValue(0);

    service.onApplicationBootstrap();
    expect(run).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(AUTO_CLOSE_INTERVAL_MS);
    expect(run).toHaveBeenCalledTimes(2);

    service.onApplicationShutdown();
    await vi.advanceTimersByTimeAsync(AUTO_CLOSE_INTERVAL_MS * 3);
    expect(run).toHaveBeenCalledTimes(2);
  });
});
