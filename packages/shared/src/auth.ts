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

/** Shortest new password: long enough to resist guessing, short enough to type on a phone. */
export const MIN_PASSWORD_LENGTH = 10;

const fitsBcrypt = (value: string) =>
  new TextEncoder().encode(value).length <= BCRYPT_MAX_BYTES;

/** Body of POST /api/auth/password. */
export const changePasswordSchema = z
  .object({
    // Asked again even though the user is logged in: an unlocked phone left
    // on a bench must not be enough to take over the account
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `At least ${MIN_PASSWORD_LENGTH} characters`)
      .refine(fitsBcrypt, 'Password is too long'),
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    message: 'The new password must be different',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
