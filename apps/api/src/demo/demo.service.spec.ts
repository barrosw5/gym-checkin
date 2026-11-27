import type { ConfigService } from '@nestjs/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { OccupancyService } from '../gym/occupancy.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { syncDemoData } from './demo-sync.js';
import { DEMO_SYNC_INTERVAL_MS, DemoService } from './demo.service.js';

vi.mock('./demo-sync.js', () => ({ DEMO_HISTORY_DAYS: 90, syncDemoData: vi.fn() }));

const NOW = new Date('2026-11-26T19:15:00Z');
const NOTHING = { created: 0, closed: 0, pruned: 0 };

describe('DemoService', () => {
  const sync = vi.mocked(syncDemoData);
  const notifyChanged = vi.fn();
  const prisma = {} as PrismaService;
  let demoMode: string | undefined;
  let service: DemoService;

  beforeEach(() => {
    vi.clearAllMocks();
    demoMode = 'true';
    sync.mockResolvedValue(NOTHING);
    service = new DemoService(
      prisma,
      { get: () => demoMode } as unknown as ConfigService,
      { notifyChanged } as unknown as OccupancyService,
    );
    vi.spyOn(service['logger'], 'log').mockImplementation(() => undefined);
    vi.spyOn(service['logger'], 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    service.onApplicationShutdown();
    vi.useRealTimers();
  });

  it.each([undefined, 'false', '1'])('stays off when DEMO_MODE is %o', async (value) => {
    demoMode = value;
    vi.useFakeTimers();

    service.onApplicationBootstrap();
    await vi.advanceTimersByTimeAsync(DEMO_SYNC_INTERVAL_MS * 2);

    expect(sync).not.toHaveBeenCalled();
  });

  it('runs on startup and then every interval, until shutdown', async () => {
    vi.useFakeTimers();

    service.onApplicationBootstrap();
    await vi.advanceTimersByTimeAsync(DEMO_SYNC_INTERVAL_MS);
    expect(sync).toHaveBeenCalledTimes(2);

    service.onApplicationShutdown();
    await vi.advanceTimersByTimeAsync(DEMO_SYNC_INTERVAL_MS * 3);
    expect(sync).toHaveBeenCalledTimes(2);
  });

  it('loads the whole history once, then only the last two days', async () => {
    await service.run(NOW);
    await service.run(NOW);

    expect(sync).toHaveBeenNthCalledWith(1, prisma, { now: NOW, days: 90, prune: true });
    expect(sync).toHaveBeenNthCalledWith(2, prisma, { now: NOW, days: 2, prune: false });
  });

  it('never throws, and retries the whole history after a failed first run', async () => {
    sync.mockRejectedValueOnce(new Error('connection lost'));

    await expect(service.run(NOW)).resolves.toBeUndefined();
    await service.run(NOW);

    expect(sync).toHaveBeenLastCalledWith(prisma, { now: NOW, days: 90, prune: true });
  });

  it('tells the open screens only when something changed', async () => {
    await service.run(NOW);
    expect(notifyChanged).not.toHaveBeenCalled();

    sync.mockResolvedValue({ ...NOTHING, closed: 1 });
    await service.run(NOW);
    expect(notifyChanged).toHaveBeenCalledOnce();
  });
});
