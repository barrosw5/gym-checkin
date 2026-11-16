import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { SettingsService } from '../settings/settings.service.js';
import { OccupancyService } from './occupancy.service.js';

// Lets pending promises (the DB count inside switchMap) resolve
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('OccupancyService', () => {
  const count = vi.fn();
  const getSettings = vi.fn();
  let service: OccupancyService;

  beforeEach(() => {
    vi.resetAllMocks();
    count.mockResolvedValue(3);
    getSettings.mockResolvedValue({ capacity: 10 });
    service = new OccupancyService(
      { session: { count } } as unknown as PrismaService,
      { get: getSettings } as unknown as SettingsService,
    );
  });

  it('counts only open sessions, with the capacity from Settings', async () => {
    await expect(service.getOccupancy()).resolves.toEqual({
      count: 3,
      capacity: 10,
    });
    expect(count).toHaveBeenCalledWith({ where: { exitAt: null } });
  });

  it('pushes the new occupancy to every subscriber with one DB count', async () => {
    const a: unknown[] = [];
    const b: unknown[] = [];
    service.updates$.subscribe((o) => a.push(o));
    service.updates$.subscribe((o) => b.push(o));

    service.notifyChanged();
    await flush();

    expect(a).toEqual([{ count: 3, capacity: 10 }]);
    expect(b).toEqual(a);
    expect(count).toHaveBeenCalledOnce();
  });

  it('keeps the stream alive after a failed count', async () => {
    const received: unknown[] = [];
    service.updates$.subscribe((o) => received.push(o));
    count.mockRejectedValueOnce(new Error('connection lost'));
    // Expected error log: keep the test output clean
    vi.spyOn(service['logger'], 'error').mockImplementation(() => undefined);

    service.notifyChanged();
    await flush();
    service.notifyChanged();
    await flush();

    expect(received).toEqual([{ count: 3, capacity: 10 }]);
  });

  it('signals shutdown and completes the updates on module destroy', () => {
    const shutdown = vi.fn();
    const completed = vi.fn();
    service.shutdown$.subscribe(shutdown);
    service.updates$.subscribe({ complete: completed });

    service.onModuleDestroy();

    expect(shutdown).toHaveBeenCalledOnce();
    expect(completed).toHaveBeenCalledOnce();
  });
});
