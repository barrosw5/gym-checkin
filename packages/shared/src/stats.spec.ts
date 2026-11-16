import { describe, expect, it } from 'vitest';
import { statsQuerySchema } from './stats.js';

describe('statsQuerySchema', () => {
  it.each(['today', 'week', 'month', 'quarter'])('accepts range=%s', (range) => {
    expect(statsQuerySchema.parse({ range })).toEqual({ range });
  });

  it('defaults to the last week', () => {
    expect(statsQuerySchema.parse({})).toEqual({ range: 'week' });
  });

  it.each(['year', 'WEEK', '7', ''])('rejects range=%j', (range) => {
    expect(statsQuerySchema.safeParse({ range }).success).toBe(false);
  });
});
