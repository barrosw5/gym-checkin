import { describe, expect, it } from 'vitest';
import { seededRandom } from './random.js';

describe('seededRandom', () => {
  it('returns numbers in [0, 1)', () => {
    const random = seededRandom(1);
    for (let i = 0; i < 1000; i++) {
      const n = random();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it('gives the same sequence for the same seed', () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
});
