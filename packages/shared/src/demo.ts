import { z } from 'zod';
import type { Occupancy } from './gym.js';

/**
 * The accounts a visitor of the public demo may open. ADMIN is a separate,
 * read-only demo account, never the real administrator.
 */
export const DEMO_ROLES = ['STUDENT', 'RECEPTION', 'ADMIN'] as const;

export const demoLoginSchema = z.object({ role: z.enum(DEMO_ROLES) });

export type DemoRole = (typeof DEMO_ROLES)[number];
export type DemoLoginInput = z.infer<typeof demoLoginSchema>;

/** What anyone may know before logging in: counts only, and only in demo mode. */
export type DemoStatus = { enabled: false } | { enabled: true; occupancy: Occupancy };
