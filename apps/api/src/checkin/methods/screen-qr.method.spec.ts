import { ForbiddenException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QrTokenService } from '../qr-token.service.js';
import { ScreenQrCheckinMethod } from './screen-qr.method.js';

describe('ScreenQrCheckinMethod', () => {
  const isValid = vi.fn();
  let method: ScreenQrCheckinMethod;

  beforeEach(() => {
    isValid.mockReset();
    method = new ScreenQrCheckinMethod({ isValid } as unknown as QrTokenService);
  });

  it('handles the SCREEN_QR method', () => {
    expect(method.method).toBe('SCREEN_QR');
  });

  it('accepts a valid token', async () => {
    isValid.mockResolvedValue(true);

    await expect(
      method.verify({ userId: 'u1', input: { method: 'SCREEN_QR', token: 't' } }),
    ).resolves.toBeUndefined();
    expect(isValid).toHaveBeenCalledWith('t');
  });

  it('rejects an expired or forged token with 403', async () => {
    isValid.mockResolvedValue(false);

    await expect(
      method.verify({ userId: 'u1', input: { method: 'SCREEN_QR', token: 't' } }),
    ).rejects.toThrow(ForbiddenException);
  });

  it("rejects another method's input (no token at all)", async () => {
    await expect(
      method.verify({ userId: 'u1', input: { method: 'SIMPLE' } }),
    ).rejects.toThrow(ForbiddenException);
    expect(isValid).not.toHaveBeenCalled();
  });
});
