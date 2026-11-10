import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.validation.js';

const validEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  JWT_SECRET: 'x'.repeat(32),
};

describe('validateEnv', () => {
  it('accepts a complete configuration', () => {
    expect(validateEnv(validEnv)).toEqual(validEnv);
  });

  it('rejects a missing JWT_SECRET', () => {
    expect(() => validateEnv({ DATABASE_URL: validEnv.DATABASE_URL })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('rejects a short JWT_SECRET', () => {
    expect(() => validateEnv({ ...validEnv, JWT_SECRET: 'short' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('rejects a missing DATABASE_URL', () => {
    expect(() => validateEnv({ JWT_SECRET: validEnv.JWT_SECRET })).toThrow(
      /DATABASE_URL/,
    );
  });

  it('reports every problem at once', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL.*JWT_SECRET/);
  });
});
