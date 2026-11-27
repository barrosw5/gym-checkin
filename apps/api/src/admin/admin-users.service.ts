import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import type { UserUpdate } from '@gym-checkin/shared';
import bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import type { AuthUser } from '../auth/auth-user.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { parseUsersCsv, type ImportError } from './users-csv.js';

const BCRYPT_ROUNDS = 10;
// 9 random bytes = 12 base64url chars (72 bits): fine for a first login
const TEMP_PASSWORD_BYTES = 9;

const USER_SELECT = {
  id: true,
  name: true,
  room: true,
  username: true,
  role: true,
  active: true,
} as const;

/** One created account. The password is returned once and never stored. */
export interface ImportedAccount {
  name: string;
  username: string;
  temporaryPassword: string;
}

@Injectable()
export class AdminUsersService {
  constructor(private prisma: PrismaService) {}

  /** The demo admin sees demo accounts only, never the real administrator. */
  list(admin: AuthUser) {
    return this.prisma.user.findMany({
      ...(admin.isDemo && { where: { isDemo: true } }),
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      select: USER_SELECT,
    });
  }

  /**
   * Creates student accounts from "name;room;username" lines.
   * All or nothing: any error (bad line, existing username) imports nobody,
   * so the admin never has to work out which half of a file went in.
   */
  async import(csv: string): Promise<ImportedAccount[]> {
    const { rows, errors } = parseUsersCsv(csv);
    if (rows.length === 0 && errors.length === 0) {
      errors.push({ line: 0, message: 'No users in the file' });
    }

    const taken = await this.prisma.user.findMany({
      where: { username: { in: rows.map((r) => r.username) } },
      select: { username: true },
    });
    const takenSet = new Set(taken.map((u) => u.username));
    for (const row of rows) {
      if (takenSet.has(row.username)) {
        errors.push({ line: row.line, message: `Username "${row.username}" already exists` });
      }
    }
    if (errors.length > 0) throw importFailed(errors);

    // Random temporary passwords: never in the file, so a leaked or
    // forgotten CSV gives nobody access
    const accounts = await Promise.all(
      rows.map(async ({ name, room, username }) => {
        const temporaryPassword = randomBytes(TEMP_PASSWORD_BYTES).toString('base64url');
        return {
          data: {
            name,
            room,
            username,
            role: Role.STUDENT,
            // Temporary password: the web app asks for a new one first
            mustChangePassword: true,
            passwordHash: await bcrypt.hash(temporaryPassword, BCRYPT_ROUNDS),
          },
          account: { name, username, temporaryPassword },
        };
      }),
    );

    try {
      // One INSERT: atomic, so it is still all or nothing
      await this.prisma.user.createMany({ data: accounts.map((a) => a.data) });
    } catch (err) {
      // Someone created one of these usernames since the check above
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('A username was taken meanwhile, try again');
      }
      throw err;
    }
    return accounts.map((a) => a.account);
  }

  async update(id: string, input: UserUpdate, admin: AuthUser) {
    // An admin locking themselves out would need a DB fix to undo
    if (id === admin.userId && input.active === false) {
      throw new BadRequestException('You cannot deactivate your own account');
    }
    const exists = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('User not found');

    // A deactivated user is locked out on their next request (JwtStrategy)
    return this.prisma.user.update({ where: { id }, data: input, select: USER_SELECT });
  }
}

function importFailed(errors: ImportError[]) {
  errors.sort((a, b) => a.line - b.line);
  return new BadRequestException({ statusCode: 400, message: 'Import failed', errors });
}
