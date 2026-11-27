import type { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import type { AuthService } from '../auth/auth.service.js';
import type { DemoAccessService } from './demo-access.service.js';
import { DemoController } from './demo.controller.js';

describe('DemoController', () => {
  it('starts a session in an httpOnly cookie, secure in production', async () => {
    const user = { id: 'u1', username: 'joaosilva', role: 'STUDENT' };
    const findAccount = vi.fn().mockResolvedValue(user);
    const login = vi.fn().mockResolvedValue({ access_token: 'jwt' });
    const cookie = vi.fn();
    const controller = new DemoController(
      { findAccount } as unknown as DemoAccessService,
      { login } as unknown as AuthService,
      { get: () => 'production' } as unknown as ConfigService,
    );

    await controller.login({ role: 'STUDENT' }, { cookie } as unknown as Response);

    expect(findAccount).toHaveBeenCalledWith('STUDENT');
    expect(login).toHaveBeenCalledWith(user);
    expect(cookie).toHaveBeenCalledWith(expect.any(String), 'jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
    });
  });
});
