import { describe, expect, it } from 'vitest';
import { demoLoginSchema } from './demo.js';

describe('demoLoginSchema', () => {
  it.each(['STUDENT', 'RECEPTION'])('accepts %s', (role) => {
    expect(demoLoginSchema.safeParse({ role }).success).toBe(true);
  });

  it.each(['ADMIN', 'student', '', undefined])('rejects %o: the admin is never a demo shortcut', (role) => {
    expect(demoLoginSchema.safeParse({ role }).success).toBe(false);
  });
});
