import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { SETTINGS_ID, SettingsService } from './settings.service.js';

describe('SettingsService', () => {
  it('reads the single global row', async () => {
    const row = { id: 'global', capacity: 10 };
    const findUniqueOrThrow = vi.fn().mockResolvedValue(row);
    const service = new SettingsService({
      settings: { findUniqueOrThrow },
    } as unknown as PrismaService);

    await expect(service.get()).resolves.toBe(row);
    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: SETTINGS_ID },
    });
  });
});
