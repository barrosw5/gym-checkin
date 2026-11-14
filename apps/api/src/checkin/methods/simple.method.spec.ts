import { describe, expect, it } from 'vitest';
import { SimpleCheckinMethod } from './simple.method.js';

describe('SimpleCheckinMethod', () => {
  it('handles the SIMPLE method', () => {
    expect(new SimpleCheckinMethod().method).toBe('SIMPLE');
  });

  it('accepts any authenticated attempt', async () => {
    await expect(new SimpleCheckinMethod().verify()).resolves.toBeUndefined();
  });
});
