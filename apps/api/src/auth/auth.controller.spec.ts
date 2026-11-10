import { UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller.js';
import type { AuthService } from './auth.service.js';

describe('AuthController', () => {
  const validateUser = vi.fn();
  const login = vi.fn();
  let controller: AuthController;
  let res: {
    cookie: ReturnType<typeof vi.fn>;
    clearCookie: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new AuthController({
      validateUser,
      login,
    } as unknown as AuthService);
    res = { cookie: vi.fn(), clearCookie: vi.fn() };
  });

  describe('login', () => {
    it('sets the JWT in an httpOnly cookie and returns the user', async () => {
      const user = { id: 'u1', username: 'joao' };
      validateUser.mockResolvedValue(user);
      login.mockResolvedValue({ access_token: 'jwt' });

      const result = await controller.login(
        { username: 'joao', password: 'password123' },
        res as unknown as Response,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'Authentication',
        'jwt',
        expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
      );
      expect(result).toEqual({ message: 'Login successful', user });
    });

    it('does not set a cookie when the credentials are invalid', async () => {
      validateUser.mockRejectedValue(new UnauthorizedException());

      await expect(
        controller.login(
          { username: 'joao', password: 'wrong' },
          res as unknown as Response,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(res.cookie).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('clears the authentication cookie', async () => {
      await controller.logout(res as unknown as Response);

      expect(res.clearCookie).toHaveBeenCalledWith('Authentication');
    });
  });
});
