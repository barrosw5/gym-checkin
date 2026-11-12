import { BadRequestException, type PipeTransform } from '@nestjs/common';
import type { z } from 'zod';

/** One validation problem, in a shape the web app can map to a form field. */
export interface ValidationIssue {
  path: string;
  message: string;
}

/**
 * Validates and parses a request value with a zod schema.
 * Usage: @Body(new ZodValidationPipe(loginSchema)) body: LoginInput
 * Invalid input never reaches the controller: the client gets a 400.
 */
export class ZodValidationPipe<
  TSchema extends z.ZodType,
> implements PipeTransform<unknown, z.infer<TSchema>> {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown): z.infer<TSchema> {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors: ValidationIssue[] = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      // 400: the request is malformed (client error), not unauthenticated (401)
      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors,
      });
    }

    // Return the parsed data, not the raw input: trimmed and without unknown keys
    return result.data;
  }
}
