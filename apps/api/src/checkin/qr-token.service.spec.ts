import type { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SettingsService } from '../settings/settings.service.js';
import { QrTokenService } from './qr-token.service.js';

const WINDOW_S = 30;
// 10:00:05 → window starts 10:00:00, the next one at 10:00:30
const NOW = new Date('2026-11-16T10:00:05Z');
const at = (secondsFromNow: number) =>
  new Date(NOW.getTime() + secondsFromNow * 1000);

function makeService(secret = 's'.repeat(32)) {
  const getSettings = vi.fn().mockResolvedValue({ qrWindowSeconds: WINDOW_S });
  const service = new QrTokenService(
    { getOrThrow: () => secret } as unknown as ConfigService,
    { get: getSettings } as unknown as SettingsService,
  );
  return { service, getSettings };
}

describe('QrTokenService', () => {
  let service: QrTokenService;
  let getSettings: ReturnType<typeof vi.fn>;
  let token: string;

  beforeEach(async () => {
    ({ service, getSettings } = makeService());
    ({ token } = await service.current(NOW));
  });

  it('returns a short base64url token and when to refresh it', async () => {
    const qr = await service.current(NOW);

    expect(qr.token).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(qr.refreshAt).toEqual(new Date('2026-11-16T10:00:30Z'));
    expect(qr.windowSeconds).toBe(WINDOW_S);
  });

  it('gives the same token for the whole window and a new one after it', async () => {
    expect((await service.current(at(20))).token).toBe(token);
    expect((await service.current(at(30))).token).not.toBe(token);
  });

  it('accepts a token from the current window', async () => {
    await expect(service.isValid(token, NOW)).resolves.toBe(true);
  });

  it('accepts a token from the previous window (scanned just before it changed)', async () => {
    await expect(service.isValid(token, at(30))).resolves.toBe(true);
  });

  it('rejects an expired token (two windows old): a photo stops working', async () => {
    await expect(service.isValid(token, at(60))).resolves.toBe(false);
  });

  it('rejects a token from the future', async () => {
    const future = (await service.current(at(30))).token;

    await expect(service.isValid(future, NOW)).resolves.toBe(false);
  });

  it('rejects a token signed with another secret (forged)', async () => {
    const forged = (await makeService('x'.repeat(32)).service.current(NOW))
      .token;

    await expect(service.isValid(forged, NOW)).resolves.toBe(false);
  });

  it('rejects garbage of any length without throwing', async () => {
    await expect(service.isValid('', NOW)).resolves.toBe(false);
    await expect(service.isValid('abc', NOW)).resolves.toBe(false);
    await expect(service.isValid('a'.repeat(64), NOW)).resolves.toBe(false);
  });

  it('invalidates old tokens when the window length changes in Settings', async () => {
    getSettings.mockResolvedValue({ qrWindowSeconds: 60 });

    await expect(service.isValid(token, NOW)).resolves.toBe(false);
  });

  it('is reusable inside its window (stateless by design)', async () => {
    // Two students scanning the same QR in the same 30 s must both get in.
    // Reuse by the same student is stopped by one_open_session_per_user (409);
    // reuse from a photo is stopped by the expiry tested above.
    await expect(service.isValid(token, NOW)).resolves.toBe(true);
    await expect(service.isValid(token, at(10))).resolves.toBe(true);
  });
});
