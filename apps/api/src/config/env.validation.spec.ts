import { describe, expect, it } from 'vitest';
import { validateEnv } from './env.validation.js';

const validEnv = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  JWT_SECRET: 'x'.repeat(32),
  QR_SECRET: 'y'.repeat(32),
};

describe('validateEnv', () => {
  it('accepts a complete configuration', () => {
    expect(validateEnv(validEnv)).toEqual(validEnv);
  });

  it('rejects a missing JWT_SECRET', () => {
    const { JWT_SECRET: _omit, ...env } = validEnv;
    expect(() => validateEnv(env)).toThrow(/JWT_SECRET/);
  });

  it('rejects a short JWT_SECRET', () => {
    expect(() => validateEnv({ ...validEnv, JWT_SECRET: 'short' })).toThrow(
      /JWT_SECRET/,
    );
  });

  it('rejects a missing DATABASE_URL', () => {
    const { DATABASE_URL: _omit, ...env } = validEnv;
    expect(() => validateEnv(env)).toThrow(/DATABASE_URL/);
  });

  it('rejects a missing or short QR_SECRET', () => {
    const { QR_SECRET: _omit, ...env } = validEnv;
    expect(() => validateEnv(env)).toThrow(/QR_SECRET/);
    expect(() => validateEnv({ ...validEnv, QR_SECRET: 'short' })).toThrow(
      /QR_SECRET/,
    );
  });

  it('accepts DEMO_MODE "true" or "false" and rejects anything else', () => {
    for (const DEMO_MODE of ['true', 'false']) {
      expect(() => validateEnv({ ...validEnv, DEMO_MODE })).not.toThrow();
    }
    expect(() => validateEnv({ ...validEnv, DEMO_MODE: 'ture' })).toThrow(/DEMO_MODE/);
  });

  it('reports every problem at once', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL.*JWT_SECRET.*QR_SECRET/);
  });
});
