import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { getCurrentUser } from './current-user.decorator.js';

const contextWith = (user: unknown) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('CurrentUser', () => {
  it('returns the user that JwtAuthGuard put on the request', () => {
    const user = { userId: 'u1', username: 'joao', role: 'STUDENT' };

    expect(getCurrentUser(undefined, contextWith(user))).toBe(user);
  });

  it('throws Unauthorized when the route has no JwtAuthGuard', () => {
    expect(() => getCurrentUser(undefined, contextWith(undefined))).toThrow(
      UnauthorizedException,
    );
  });
});
