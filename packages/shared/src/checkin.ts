import { z } from 'zod';

/**
 * Ways a student can check in. Mirrors the Prisma enum `CheckinMethod`
 * (the API has a test that fails if the two drift apart).
 */
export const CHECKIN_METHODS = ['SCREEN_QR', 'RECEPTION_APPROVAL'] as const;

export type CheckinMethodName = (typeof CHECKIN_METHODS)[number];

/**
 * Body of POST /api/checkin. Each method declares the proof it needs:
 * SCREEN_QR must send the token read from the reception screen.
 * Discriminated union: `{ method: 'SCREEN_QR' }` without a token is a 400.
 */
export const checkinSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('SCREEN_QR'),
    // base64url, bounded: never hash or compare arbitrarily large input
    token: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/, 'Invalid QR token'),
  }),
  z.object({ method: z.literal('RECEPTION_APPROVAL') }),
]);

export type CheckinInput = z.infer<typeof checkinSchema>;
