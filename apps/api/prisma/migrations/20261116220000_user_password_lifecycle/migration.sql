-- Password lifecycle: public demo accounts, forced change after a temporary
-- password, and logging out other devices when the password changes.
-- Additive with defaults: existing rows stay valid, no data rewrite.
ALTER TABLE "User"
  ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "passwordChangedAt" TIMESTAMP(3);
