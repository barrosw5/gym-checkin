import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const PASSWORD = 'password123';
  let passwordHash: string;

  const findUnique = vi.fn();
  const update = vi.fn();
  const sign = vi.fn();
  let service: AuthService;

  beforeAll(async () => {
    // Low cost factor: keeps the test fast, the algorithm is the same
    passwordHash = await bcrypt.hash(PASSWORD, 4);
  });

  beforeEach(() => {
    vi.resetAllMocks();
    // Only the methods the service actually uses are mocked
    const prisma = { user: { findUnique, update } } as unknown as PrismaService;
    const jwt = { sign } as unknown as JwtService;
    service = new AuthService(prisma, jwt);
  });

  describe('validateUser', () => {
    it('returns the user without passwordHash when credentials are valid', async () => {
      findUnique.mockResolvedValue({
        id: 'u1',
        username: 'joao',
        role: 'STUDENT',
        active: true,
        passwordHash,
      });

      const result = await service.validateUser('joao', PASSWORD);

      expect(result).toEqual({
        id: 'u1',
        username: 'joao',
        role: 'STUDENT',
        active: true,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('throws Unauthorized for an inactive user, even with the right password', async () => {
      findUnique.mockResolvedValue({ id: 'u1', active: false, passwordHash });

      await expect(service.validateUser('joao', PASSWORD)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('uses the same message for an inactive user and a wrong password', async () => {
      // Must not reveal that the account exists but was deactivated
      findUnique.mockResolvedValueOnce({
        id: 'u1',
        active: false,
        passwordHash,
      });
      const inactive = await service
        .validateUser('joao', PASSWORD)
        .catch((e: Error) => e.message);

      findUnique.mockResolvedValueOnce({
        id: 'u1',
        active: true,
        passwordHash,
      });
      const wrongPassword = await service
        .validateUser('joao', 'wrong')
        .catch((e: Error) => e.message);

      expect(inactive).toBe(wrongPassword);
    });

    it('throws Unauthorized when the user does not exist', async () => {
      findUnique.mockResolvedValue(null);

      await expect(service.validateUser('ghost', PASSWORD)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws Unauthorized when the password is wrong', async () => {
      findUnique.mockResolvedValue({ id: 'u1', passwordHash });

      await expect(service.validateUser('joao', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('uses the same message for unknown user and wrong password', async () => {
      // Avoids leaking which usernames exist (user enumeration)
      findUnique.mockResolvedValueOnce(null);
      const unknownUser = await service
        .validateUser('ghost', PASSWORD)
        .catch((e: Error) => e.message);

      findUnique.mockResolvedValueOnce({ id: 'u1', passwordHash });
      const wrongPassword = await service
        .validateUser('joao', 'wrong')
        .catch((e: Error) => e.message);

      expect(unknownUser).toBe(wrongPassword);
    });
  });

  describe('login', () => {
    it('signs a JWT with sub, username and role', async () => {
      sign.mockReturnValue('signed.jwt.token');

      const result = await service.login({
        id: 'u1',
        username: 'joao',
        role: 'STUDENT',
      });

      expect(sign).toHaveBeenCalledWith({
        username: 'joao',
        sub: 'u1',
        role: 'STUDENT',
      });
      expect(result).toEqual({ access_token: 'signed.jwt.token' });
    });
  });

  describe('getActiveUser', () => {
    it('returns an active user without passwordHash', async () => {
      findUnique.mockResolvedValue({ id: 'u1', active: true, passwordHash });

      const result = await service.getActiveUser('u1');

      expect(result).toEqual({ id: 'u1', active: true });
    });

    it('throws Unauthorized when the user was deactivated', async () => {
      findUnique.mockResolvedValue({ id: 'u1', active: false, passwordHash });

      await expect(service.getActiveUser('u1')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws Unauthorized when the user no longer exists', async () => {
      findUnique.mockResolvedValue(null);

      await expect(service.getActiveUser('gone')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getProfile', () => {
    it('rejects a deactivated user', async () => {
      findUnique.mockResolvedValue({ id: 'u1', active: false, passwordHash });

      await expect(service.getProfile('u1')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getActiveUser after a password change', () => {
    const changedAt = new Date('2026-11-16T20:00:00Z');
    const seconds = (d: Date) => d.getTime() / 1000;

    beforeEach(() => {
      findUnique.mockResolvedValue({
        id: 'u1',
        active: true,
        passwordHash,
        passwordChangedAt: changedAt,
      });
    });

    it('rejects a token issued before the change (other devices are logged out)', async () => {
      await expect(
        service.getActiveUser('u1', seconds(changedAt) - 1),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('accepts a token issued in the same second or later', async () => {
      await expect(service.getActiveUser('u1', seconds(changedAt))).resolves.toMatchObject({
        id: 'u1',
      });
    });
  });

  describe('changePassword', () => {
    const NOW = new Date('2026-11-16T20:00:00.750Z');
    // Built per test: passwordHash only exists after beforeAll has run
    let user: Record<string, unknown>;
    beforeEach(() => {
      user = { id: 'u1', active: true, isDemo: false, passwordHash };
    });

    it('stores a new hash, clears mustChangePassword and logs out older tokens', async () => {
      findUnique.mockResolvedValue(user);
      update.mockImplementation(({ data }) => ({ ...user, ...data }));

      const result = await service.changePassword('u1', PASSWORD, 'brand-new-password', NOW);

      const { data } = update.mock.calls[0][0];
      await expect(bcrypt.compare('brand-new-password', data.passwordHash)).resolves.toBe(true);
      expect(data.mustChangePassword).toBe(false);
      // Rounded down to the second, like the JWT iat of the next token
      expect(data.passwordChangedAt).toEqual(new Date('2026-11-16T20:00:00Z'));
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('refuses a wrong current password with 403 and changes nothing', async () => {
      findUnique.mockResolvedValue(user);

      await expect(
        service.changePassword('u1', 'wrong-password', 'brand-new-password', NOW),
      ).rejects.toThrow('Current password is incorrect');
      expect(update).not.toHaveBeenCalled();
    });

    it('refuses public demo accounts (a visitor would lock everyone out)', async () => {
      findUnique.mockResolvedValue({ ...user, isDemo: true });

      await expect(
        service.changePassword('u1', PASSWORD, 'brand-new-password', NOW),
      ).rejects.toThrow(ForbiddenException);
      expect(update).not.toHaveBeenCalled();
    });

    it('refuses a deactivated user with 401', async () => {
      findUnique.mockResolvedValue({ ...user, active: false });

      await expect(
        service.changePassword('u1', PASSWORD, 'brand-new-password', NOW),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
