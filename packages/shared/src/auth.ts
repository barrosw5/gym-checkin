import { z } from 'zod';

// bcrypt only uses the first 72 bytes of a password; longer input would be
// silently truncated, and unbounded input is a cheap way to burn server CPU
const BCRYPT_MAX_BYTES = 72;

/**
 * Body of POST /api/auth/login. Used by the API (authoritative validation)
 * and by the web login form (UX only).
 * Unknown keys are stripped, so extra fields (e.g. "role") never reach the service.
 */
export const loginSchema = z.object({
  // Trim: phone keyboards often append a trailing space
  username: z.string().trim().min(1, 'Username is required').max(50),
  // No trim: spaces may be part of the password
  password: z
    .string()
    .min(1, 'Password is required')
    .refine(
      (value) => new TextEncoder().encode(value).length <= BCRYPT_MAX_BYTES,
      'Password is too long',
    ),
});

/** Derived from the schema, so the type and the validation never drift apart. */
export type LoginInput = z.infer<typeof loginSchema>;
