/**
 * Every API route lives under /api; all other paths belong to the frontend.
 * Shared so the API (global prefix) and the web app (fetch URLs) never drift apart.
 */
export const API_PREFIX = 'api';

export { MIN_PASSWORD_LENGTH, changePasswordSchema, loginSchema } from './auth.js';
export type { ChangePasswordInput, LoginInput } from './auth.js';
export { CHECKIN_METHODS, checkinSchema } from './checkin.js';
export type { CheckinInput, CheckinMethodName } from './checkin.js';
export type { Occupancy } from './gym.js';
export {
  MAX_IMPORT_ROWS,
  USERNAME_PATTERN,
  importedUserSchema,
  sessionCorrectionSchema,
  sessionsQuerySchema,
  userImportSchema,
  userUpdateSchema,
} from './admin.js';
export type {
  ImportedUser,
  SessionCorrection,
  SessionsQuery,
  UserImportInput,
  UserUpdate,
} from './admin.js';
