import { BadRequestException } from '@nestjs/common';
import { loginSchema } from '@gym-checkin/shared';
import { describe, expect, it } from 'vitest';
import { ZodValidationPipe } from './zod-validation.pipe.js';

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe(loginSchema);

  it('returns the parsed value (trimmed, unknown keys stripped)', () => {
    const result = pipe.transform({
      username: ' joao ',
      password: 'secret',
      role: 'ADMIN',
    });

    expect(result).toEqual({ username: 'joao', password: 'secret' });
  });

  it('throws BadRequest with one issue per invalid field', () => {
    let error: unknown;
    try {
      pipe.transform({ username: 123 });
    } catch (e) {
      error = e;
    }

    expect(error).toBeInstanceOf(BadRequestException);
    const body = (error as BadRequestException).getResponse();
    expect(body).toMatchObject({
      statusCode: 400,
      message: 'Validation failed',
      errors: [
        { path: 'username', message: expect.any(String) },
        { path: 'password', message: expect.any(String) },
      ],
    });
  });

  it('rejects a missing body', () => {
    expect(() => pipe.transform(undefined)).toThrow(BadRequestException);
  });
});
