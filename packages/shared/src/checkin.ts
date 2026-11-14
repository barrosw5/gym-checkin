import { z } from 'zod';

/**
 * Ways a student can check in. Mirrors the Prisma enum `CheckinMethod`
 * (the API has a test that fails if the two drift apart).
 */
export const CHECKIN_METHODS = ['SIMPLE', 'SCREEN_QR', 'RECEPTION_APPROVAL'] as const;

export type CheckinMethodName = (typeof CHECKIN_METHODS)[number];

/**
 * Body of POST /api/checkin. Only the method for now; the QR method
 * (Phase 3) will add its `token` here.
 */
export const checkinSchema = z.object({
  method: z.enum(CHECKIN_METHODS),
});

export type CheckinInput = z.infer<typeof checkinSchema>;
