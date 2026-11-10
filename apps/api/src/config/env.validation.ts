const MIN_SECRET_LENGTH = 32;

/**
 * Validates the environment variables at startup (fail fast).
 * A misconfigured API must refuse to start instead of failing later,
 * for example by signing tokens with an empty secret.
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const errors: string[] = [];

  if (typeof config.DATABASE_URL !== 'string' || !config.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (
    typeof config.JWT_SECRET !== 'string' ||
    config.JWT_SECRET.length < MIN_SECRET_LENGTH
  ) {
    errors.push(`JWT_SECRET is required (at least ${MIN_SECRET_LENGTH} chars)`);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment: ${errors.join('; ')}`);
  }

  return config;
}
