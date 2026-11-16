import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../auth/auth-user.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { AdminUsersService } from './admin-users.service.js';

const admin: AuthUser = { userId: 'adm', username: 'admin', role: 'ADMIN' };

describe('AdminUsersService', () => {
  const user = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
  };
  let service: AdminUsersService;

  beforeEach(() => {
    vi.clearAllMocks();
    user.findMany.mockResolvedValue([]);
    user.createMany.mockResolvedValue({ count: 2 });
    service = new AdminUsersService({ user } as unknown as PrismaService);
  });

  describe('import', () => {
    it('creates students with random temporary passwords, stored only as hashes', async () => {
      const created = await service.import('Ana;101;ana\nRui;102;rui');

      expect(created.map((a) => a.username)).toEqual(['ana', 'rui']);
      const [ana, rui] = created;
      expect(ana.temporaryPassword).toMatch(/^[A-Za-z0-9_-]{12}$/);
      expect(ana.temporaryPassword).not.toBe(rui.temporaryPassword);

      const { data } = user.createMany.mock.calls[0][0];
      expect(data[0]).toMatchObject({ name: 'Ana', room: '101', username: 'ana', role: 'STUDENT' });
      expect(data[0].passwordHash).not.toContain(ana.temporaryPassword);
      await expect(bcrypt.compare(ana.temporaryPassword, data[0].passwordHash)).resolves.toBe(true);
    });

    it('imports nobody when any line is bad (all or nothing)', async () => {
      await expect(service.import('Ana;101;ana\nbroken line')).rejects.toThrow(
        BadRequestException,
      );
      expect(user.createMany).not.toHaveBeenCalled();
    });

    it('reports usernames that already exist, with their line', async () => {
      user.findMany.mockResolvedValue([{ username: 'rui' }]);

      const error = await service.import('Ana;101;ana\nRui;102;rui').catch((e: unknown) => e);

      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).getResponse()).toMatchObject({
        errors: [{ line: 2, message: 'Username "rui" already exists' }],
      });
      expect(user.createMany).not.toHaveBeenCalled();
    });

    it('rejects a file with no users', async () => {
      await expect(service.import('nome;quarto;username\n\n')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('returns 409 if a username is taken between the check and the insert', async () => {
      user.createMany.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Unique', { code: 'P2002', clientVersion: 'test' }),
      );

      await expect(service.import('Ana;101;ana')).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('deactivates a user', async () => {
      user.findUnique.mockResolvedValue({ id: 'u1' });

      await service.update('u1', { active: false }, admin);

      expect(user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' }, data: { active: false } }),
      );
    });

    it('does not let an admin deactivate their own account (lockout)', async () => {
      await expect(service.update('adm', { active: false }, admin)).rejects.toThrow(
        BadRequestException,
      );
      expect(user.update).not.toHaveBeenCalled();
    });

    it('returns 404 for an unknown user', async () => {
      user.findUnique.mockResolvedValue(null);

      await expect(service.update('u1', { room: '5' }, admin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
