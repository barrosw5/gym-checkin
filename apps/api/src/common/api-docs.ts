import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiQuery, type SchemaObject } from '@nestjs/swagger';
import { z } from 'zod';

/**
 * A zod schema as an OpenAPI 3.0 schema. The docs are generated from the
 * same schema the ZodValidationPipe enforces, so they can never disagree.
 * io: 'input' describes what the client sends (before defaults apply).
 */
export const toOpenApi = (schema: z.ZodType): SchemaObject =>
  z.toJSONSchema(schema, { target: 'openapi-3.0', io: 'input' }) as SchemaObject;

/** Documents a JSON body validated with ZodValidationPipe. */
export const ApiZodBody = (schema: z.ZodType) =>
  applyDecorators(
    ApiBody({ schema: toOpenApi(schema) }),
    ApiBadRequestResponse({ description: 'Validation failed: `errors` lists each field' }),
  );

/**
 * Documents query parameters validated with ZodValidationPipe. A union of
 * objects (e.g. `?open=true` or `?from=&to=`) lists every parameter of
 * every option, all optional: OpenAPI has no "one of these sets".
 */
export const ApiZodQuery = (schema: z.ZodType) => {
  const json = toOpenApi(schema);
  const options = (json.anyOf as SchemaObject[] | undefined) ?? [json];
  const seen = new Set<string>();
  const params = options.flatMap((option) =>
    Object.entries(option.properties ?? {})
      .filter(([name]) => !seen.has(name) && seen.add(name))
      .map(([name, property]) =>
        ApiQuery({
          name,
          schema: property,
          required: !json.anyOf && (option.required ?? []).includes(name),
        }),
      ),
  );
  return applyDecorators(...params, ApiBadRequestResponse({ description: 'Invalid query' }));
};
