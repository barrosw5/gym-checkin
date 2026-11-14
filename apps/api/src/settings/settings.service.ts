import { Injectable } from '@nestjs/common';
import type { Settings } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

/** Id of the only Settings row (created by a migration, see schema.prisma). */
export const SETTINGS_ID = 'global';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * The residence's configuration. Read on every call (one primary-key
   * lookup) instead of cached, so an admin change applies immediately.
   * Throws if the row is missing: that is a broken deploy, not a user error.
   */
  get(): Promise<Settings> {
    return this.prisma.settings.findUniqueOrThrow({
      where: { id: SETTINGS_ID },
    });
  }
}
