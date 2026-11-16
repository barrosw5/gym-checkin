import { describe, expect, it } from 'vitest';
import {
  importedUserSchema,
  sessionCorrectionSchema,
  sessionsQuerySchema,
  userUpdateSchema,
} from './admin.js';

describe('sessionsQuerySchema', () => {
  it('accepts open=true or a from/to range with offsets', () => {
    expect(sessionsQuerySchema.safeParse({ open: 'true' }).success).toBe(true);
    expect(
      sessionsQuerySchema.safeParse({
        from: '2026-11-16T00:00:00Z',
        to: '2026-11-17T00:00:00+01:00',
      }).success,
    ).toBe(true);
  });

  it.each([
    ['nothing', {}],
    ['a range without an offset (ambiguous time zone)', { from: '2026-11-16T00:00:00', to: '2026-11-17T00:00:00' }],
    ['half a range', { from: '2026-11-16T00:00:00Z' }],
  ])('rejects %s', (_case, query) => {
    expect(sessionsQuerySchema.safeParse(query).success).toBe(false);
  });
});

describe('sessionCorrectionSchema', () => {
  it('accepts entryAt and/or exitAt', () => {
    expect(sessionCorrectionSchema.safeParse({ exitAt: '2026-11-16T18:00:00Z' }).success).toBe(true);
  });

  it('rejects an empty correction and non-dates', () => {
    expect(sessionCorrectionSchema.safeParse({}).success).toBe(false);
    expect(sessionCorrectionSchema.safeParse({ exitAt: 'yesterday' }).success).toBe(false);
  });
});

describe('importedUserSchema', () => {
  it('trims and lowercases the username', () => {
    expect(
      importedUserSchema.parse({ name: ' Ana ', room: ' 12 ', username: ' Ana.Silva ' }),
    ).toEqual({ name: 'Ana', room: '12', username: 'ana.silva' });
  });

  it.each([
    ['an empty name', { name: '', room: '1', username: 'ana' }],
    ['a too short username', { name: 'Ana', room: '1', username: 'an' }],
    ['spaces in the username', { name: 'Ana', room: '1', username: 'ana silva' }],
  ])('rejects %s', (_case, row) => {
    expect(importedUserSchema.safeParse(row).success).toBe(false);
  });
});

describe('userUpdateSchema', () => {
  it('needs at least one field, and strips unknown ones (no role changes)', () => {
    expect(userUpdateSchema.safeParse({}).success).toBe(false);
    expect(userUpdateSchema.parse({ active: false, role: 'ADMIN' })).toEqual({
      active: false,
    });
  });
});
