import { UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller.js';
import type { ConfigService } from '@nestjs/config';
import type { AuthService } from './auth.service.js';

describe('AuthController', () => {
  const validateUser = vi.fn();
  const login = vi.fn();
  const getProfile = vi.fn();
  const getConfig = vi.fn();
  let controller: AuthController;
  let res: {
    cookie: ReturnType<typeof vi.fn>;
    clearCookie: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.resetAllMocks();
    controller = new AuthController(
      { validateUser, login, getProfile } as unknown as AuthService,
      { get: getConfig } as unknown as ConfigService,
    );
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

    it.each([
      ['production', true],
      ['development', false],
    ])('sets cookie secure flag for NODE_ENV=%s -> %s', async (env, secure) => {
      getConfig.mockReturnValue(env);
      validateUser.mockResolvedValue({ id: 'u1' });
      login.mockResolvedValue({ access_token: 'jwt' });

      await controller.login(
        { username: 'joao', password: 'password123' },
        res as unknown as Response,
      );

      expect(res.cookie).toHaveBeenCalledWith(
        'Authentication',
        'jwt',
        expect.objectContaining({ secure }),
      );
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

  describe('getMe', () => {
    it('loads the profile of the authenticated user', async () => {
      const profile = { id: 'u1', username: 'joao' };
      getProfile.mockResolvedValue(profile);

      const result = await controller.getMe({
        userId: 'u1',
        username: 'joao',
        role: 'STUDENT',
      });

      expect(getProfile).toHaveBeenCalledWith('u1');
      expect(result).toBe(profile);
    });
  });

  describe('logout', () => {
    it('clears the authentication cookie', async () => {
      await controller.logout(res as unknown as Response);

      expect(res.clearCookie).toHaveBeenCalledWith('Authentication');
    });
  });
});
