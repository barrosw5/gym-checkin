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

  // Separate secrets: a leaked QR secret must not let anyone forge logins
  for (const name of ['JWT_SECRET', 'QR_SECRET']) {
    const value = config[name];
    if (typeof value !== 'string' || value.length < MIN_SECRET_LENGTH) {
      errors.push(`${name} is required (at least ${MIN_SECRET_LENGTH} chars)`);
    }
  }

  // A typo like "ture" would silently leave the demo off
  if (![undefined, '', 'true', 'false'].includes(config.DEMO_MODE as string | undefined)) {
    errors.push('DEMO_MODE must be "true" or "false"');
  }

  if (errors.length > 0) {
    throw new Error(`Invalid environment: ${errors.join('; ')}`);
  }

  return config;
}
