import { describe, expect, it } from 'vitest';
import { demoLoginSchema } from './demo.js';

describe('demoLoginSchema', () => {
  it.each(['STUDENT', 'RECEPTION', 'ADMIN'])('accepts %s', (role) => {
    expect(demoLoginSchema.safeParse({ role }).success).toBe(true);
  });

  it.each(['student', 'admin', '', undefined])('rejects %o', (role) => {
    expect(demoLoginSchema.safeParse({ role }).success).toBe(false);
  });
});
