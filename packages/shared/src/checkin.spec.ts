import { describe, expect, it } from 'vitest';
import { checkinSchema } from './checkin.js';

describe('checkinSchema', () => {
  it.each([
    { method: 'SIMPLE' },
    { method: 'SCREEN_QR', token: 'abc_DEF-123' },
    { method: 'RECEPTION_APPROVAL' },
  ])('accepts %o', (body) => {
    expect(checkinSchema.safeParse(body).success).toBe(true);
  });

  it.each([
    ['missing method', {}],
    ['unknown method', { method: 'TELEPORT' }],
    ['lowercase method', { method: 'simple' }],
    ['MANUAL (admin correction, not a check-in method)', { method: 'MANUAL' }],
    ['SCREEN_QR without a token', { method: 'SCREEN_QR' }],
    ['SCREEN_QR with an empty token', { method: 'SCREEN_QR', token: '' }],
    ['SCREEN_QR with a non-base64url token', { method: 'SCREEN_QR', token: 'a b/c' }],
    ['SCREEN_QR with a huge token', { method: 'SCREEN_QR', token: 'a'.repeat(65) }],
  ])('rejects %s', (_case, body) => {
    expect(checkinSchema.safeParse(body).success).toBe(false);
  });

  it('strips unknown fields (no mass assignment)', () => {
    const result = checkinSchema.parse({
      method: 'SIMPLE',
      userId: 'someone-else',
    });

    expect(result).toEqual({ method: 'SIMPLE' });
  });
});
