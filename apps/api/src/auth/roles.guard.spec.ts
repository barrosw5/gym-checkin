import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from './roles.guard.js';

// Real Reflector + real decorator: tests that the metadata wiring works,
// not just that the guard reads a mocked value
@Roles('ADMIN')
class AdminController {
  default() {}

  @Roles('RECEPTION', 'ADMIN')
  staff() {}
}

class OpenController {
  open() {}
}

function contextFor(
  controller: new () => object,
  handler: string,
  user?: { role?: string },
): ExecutionContext {
  return {
    getHandler: () =>
      (controller.prototype as Record<string, unknown>)[handler],
    getClass: () => controller,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('allows any authenticated user when no @Roles() is set', () => {
    expect(
      guard.canActivate(
        contextFor(OpenController, 'open', { role: 'STUDENT' }),
      ),
    ).toBe(true);
  });

  it('allows a user whose role is listed', () => {
    expect(
      guard.canActivate(
        contextFor(AdminController, 'staff', { role: 'RECEPTION' }),
      ),
    ).toBe(true);
  });

  it('rejects a user whose role is not listed with 403', () => {
    expect(() =>
      guard.canActivate(
        contextFor(AdminController, 'staff', { role: 'STUDENT' }),
      ),
    ).toThrow(ForbiddenException);
  });

  it('uses the controller-level roles when the method has none', () => {
    expect(() =>
      guard.canActivate(
        contextFor(AdminController, 'default', { role: 'RECEPTION' }),
      ),
    ).toThrow(ForbiddenException);
    expect(
      guard.canActivate(
        contextFor(AdminController, 'default', { role: 'ADMIN' }),
      ),
    ).toBe(true);
  });

  it.each([
    ['no user on the request (guard order mistake)', undefined],
    ['a user without a role', {}],
  ])('rejects %s', (_case, user) => {
    expect(() =>
      guard.canActivate(contextFor(AdminController, 'staff', user)),
    ).toThrow(ForbiddenException);
  });
});
