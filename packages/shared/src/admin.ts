import { z } from 'zod';

/** ISO 8601 instant with an offset ("...Z" or "+01:00"): never ambiguous. */
const instant = z.iso.datetime({ offset: true });

/**
 * Query of GET /api/admin/sessions: open sessions, or a time range.
 * The client sends the range (e.g. "today" in the residence's time zone),
 * so the API never has to guess a time zone.
 */
export const sessionsQuerySchema = z.union([
  z.object({ open: z.literal('true') }),
  z.object({ from: instant, to: instant }),
]);
export type SessionsQuery = z.infer<typeof sessionsQuerySchema>;

/**
 * Body of PATCH /api/admin/sessions/:id (reception/admin correction).
 * Setting exitAt on an open session closes it ("gave the key back").
 */
export const sessionCorrectionSchema = z
  .object({ entryAt: instant.optional(), exitAt: instant.optional() })
  .refine((v) => v.entryAt || v.exitAt, 'Nothing to change');
export type SessionCorrection = z.infer<typeof sessionCorrectionSchema>;

/** Lowercase letters, digits, dot, dash, underscore: safe in URLs and logs. */
export const USERNAME_PATTERN = /^[a-z0-9._-]{3,30}$/;

/** One resident from the import file (GDPR: only name, room, username). */
export const importedUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  room: z.string().trim().min(1, 'Room is required').max(20),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(USERNAME_PATTERN, 'Username: 3-30 chars, a-z 0-9 . _ -'),
});
export type ImportedUser = z.infer<typeof importedUserSchema>;

/** Most rows per import: keeps one request (and its bcrypt work) bounded. */
export const MAX_IMPORT_ROWS = 200;

/** Body of POST /api/admin/users/import: the CSV text, "name;room;username". */
export const userImportSchema = z.object({
  csv: z.string().min(1, 'The file is empty').max(100_000),
});
export type UserImportInput = z.infer<typeof userImportSchema>;

/** Body of PATCH /api/admin/users/:id. */
export const userUpdateSchema = z
  .object({
    active: z.boolean().optional(),
    room: z.string().trim().min(1).max(20).optional(),
  })
  .refine((v) => v.active !== undefined || v.room !== undefined, 'Nothing to change');
export type UserUpdate = z.infer<typeof userUpdateSchema>;
