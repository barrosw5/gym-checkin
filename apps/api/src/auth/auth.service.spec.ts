import { UnauthorizedException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

describe('AuthService', () => {
  const PASSWORD = 'password123';
  let passwordHash: string;

  const findUnique = vi.fn();
  const sign = vi.fn();
  let service: AuthService;

  beforeAll(async () => {
    // Low cost factor: keeps the test fast, the algorithm is the same
    passwordHash = await bcrypt.hash(PASSWORD, 4);
  });

  beforeEach(() => {
    vi.resetAllMocks();
    // Only the methods the service actually uses are mocked
    const prisma = { user: { findUnique } } as unknown as PrismaService;
    const jwt = { sign } as unknown as JwtService;
    service = new AuthService(prisma, jwt);
  });

  describe('validateUser', () => {
    it('returns the user without passwordHash when credentials are valid', async () => {
      findUnique.mockResolvedValue({
        id: 'u1',
        username: 'joao',
        role: 'STUDENT',
        passwordHash,
      });

      const result = await service.validateUser('joao', PASSWORD);

      expect(result).toEqual({ id: 'u1', username: 'joao', role: 'STUDENT' });
      expect(result).not.toHaveProperty('passwordHash');
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

  describe('getProfile', () => {
    it('returns the profile without passwordHash', async () => {
      findUnique.mockResolvedValue({ id: 'u1', name: 'João', passwordHash });

      const result = await service.getProfile('u1');

      expect(result).toEqual({ id: 'u1', name: 'João' });
    });

    it('throws Unauthorized when the user no longer exists', async () => {
      findUnique.mockResolvedValue(null);

      await expect(service.getProfile('gone')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
