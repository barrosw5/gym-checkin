-- Status becomes an enum: a typo like 'APROVED' is now a DB error
CREATE TYPE "CheckinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- Convert in place instead of DROP/ADD (what `prisma migrate diff` generates),
-- so existing rows keep their status. Fails loudly on an unknown value.
ALTER TABLE "CheckinRequest"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" SET DATA TYPE "CheckinRequestStatus"
    USING "status"::"CheckinRequestStatus",
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Real foreign keys: a request can't point to a user that doesn't exist.
-- RESTRICT on the requester (history is kept); SET NULL on the decider, so
-- removing a reception account doesn't remove the requests it decided.
ALTER TABLE "CheckinRequest"
  ADD CONSTRAINT "CheckinRequest_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "CheckinRequest_decidedById_fkey" FOREIGN KEY ("decidedById")
    REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Rules Prisma's schema cannot express:
--  * a request expires after it is created
--  * approved/rejected always have a decision time; pending/expired never do
ALTER TABLE "CheckinRequest"
  ADD CONSTRAINT "checkin_request_expires_after_creation"
    CHECK ("expiresAt" > "createdAt"),
  ADD CONSTRAINT "checkin_request_decided_at_matches_status"
    CHECK (("status" IN ('APPROVED', 'REJECTED')) = ("decidedAt" IS NOT NULL));

-- One pending request per user, enforced by the DB like one_open_session_per_user:
-- two quick taps on "Pedir entrada" can't create two requests (race condition).
-- Partial: any number of past (approved/rejected/expired) requests is fine.
CREATE UNIQUE INDEX "one_pending_request_per_user"
  ON "CheckinRequest" ("userId")
  WHERE "status" = 'PENDING';
