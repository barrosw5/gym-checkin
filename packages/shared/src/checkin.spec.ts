import { describe, expect, it } from 'vitest';
import { checkinSchema } from './checkin.js';

describe('checkinSchema', () => {
  it.each(['SIMPLE', 'SCREEN_QR', 'RECEPTION_APPROVAL'])('accepts %s', (method) => {
    expect(checkinSchema.safeParse({ method }).success).toBe(true);
  });

  it.each([
    ['missing method', {}],
    ['unknown method', { method: 'TELEPORT' }],
    ['lowercase method', { method: 'simple' }],
    ['MANUAL (admin correction, not a check-in method)', { method: 'MANUAL' }],
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
