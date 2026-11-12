import { describe, expect, it } from 'vitest';
import { loginSchema } from './auth.js';

describe('loginSchema', () => {
  it('accepts a valid body', () => {
    const result = loginSchema.safeParse({ username: 'joao', password: 'secret' });

    expect(result.success).toBe(true);
  });

  it('trims the username but not the password', () => {
    const result = loginSchema.parse({ username: ' joao ', password: ' secret ' });

    expect(result).toEqual({ username: 'joao', password: ' secret ' });
  });

  it.each([
    ['missing username', { password: 'secret' }],
    ['missing password', { username: 'joao' }],
    ['empty body', {}],
    ['blank username', { username: '   ', password: 'secret' }],
    ['empty password', { username: 'joao', password: '' }],
    ['non-string username', { username: 123, password: 'secret' }],
    ['object as username (injection attempt)', { username: { $gt: '' }, password: 'secret' }],
  ])('rejects %s', (_case, body) => {
    expect(loginSchema.safeParse(body).success).toBe(false);
  });

  it('accepts a password of exactly 72 bytes', () => {
    const result = loginSchema.safeParse({ username: 'joao', password: 'a'.repeat(72) });

    expect(result.success).toBe(true);
  });

  it('rejects a password over 72 bytes, counting bytes not characters', () => {
    // 37 x "ç" = 37 characters but 74 bytes in UTF-8
    const result = loginSchema.safeParse({ username: 'joao', password: 'ç'.repeat(37) });

    expect(result.success).toBe(false);
  });

  it('strips unknown fields (no mass assignment)', () => {
    const result = loginSchema.parse({
      username: 'joao',
      password: 'secret',
      role: 'ADMIN',
    });

    expect(result).not.toHaveProperty('role');
  });
});
