import { UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';

describe('JwtStrategy', () => {
  const getActiveUser = vi.fn();
  let strategy: JwtStrategy;

  beforeEach(() => {
    vi.resetAllMocks();
    const config = {
      getOrThrow: () => 'x'.repeat(32),
    } as unknown as ConfigService;
    strategy = new JwtStrategy(config, {
      getActiveUser,
    } as unknown as AuthService);
  });

  it('rejects a valid token whose user was deactivated', async () => {
    getActiveUser.mockRejectedValue(new UnauthorizedException());

    await expect(
      strategy.validate({ sub: 'u1', username: 'joao', role: 'STUDENT' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(getActiveUser).toHaveBeenCalledWith('u1');
  });

  it('takes the role from the database, not from the token', async () => {
    // Token issued while the user was a STUDENT, since promoted to RECEPTION
    getActiveUser.mockResolvedValue({
      id: 'u1',
      username: 'joao',
      role: 'RECEPTION',
    });

    const user = await strategy.validate({
      sub: 'u1',
      username: 'joao',
      role: 'STUDENT',
    });

    expect(user).toEqual({ userId: 'u1', username: 'joao', role: 'RECEPTION' });
  });
});
