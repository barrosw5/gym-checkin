-- Manual corrections (reception/admin) can now edit session times, so the
-- DB guards the invariants every statistic relies on:
--  * a session never ends before it starts
--  * closed <=> closedBy is known (open sessions have neither)
ALTER TABLE "Session"
  ADD CONSTRAINT "session_exit_after_entry"
    CHECK ("exitAt" IS NULL OR "exitAt" >= "entryAt"),
  ADD CONSTRAINT "session_closed_by_matches_exit"
    CHECK (("exitAt" IS NULL) = ("closedBy" IS NULL));

-- Listing sessions by time range (reception "today", statistics in Phase 5)
CREATE INDEX "Session_entryAt_idx" ON "Session" ("entryAt");
