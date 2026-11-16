-- SIMPLE (no proof of presence) is no longer a check-in method.
-- Old sessions keep SessionMethod 'SIMPLE' (history); only CheckinMethod changes.
--
-- Postgres cannot drop a value from an enum: create the new type and swap.
ALTER TABLE "Settings" ALTER COLUMN "enabledMethods" DROP DEFAULT;
ALTER TYPE "CheckinMethod" RENAME TO "CheckinMethod_old";
CREATE TYPE "CheckinMethod" AS ENUM ('SCREEN_QR', 'RECEPTION_APPROVAL');

-- Remove SIMPLE from the enabled list. If it was the only one, the list would
-- be empty and nobody could check in: enable both real methods instead.
ALTER TABLE "Settings"
  ALTER COLUMN "enabledMethods" SET DATA TYPE "CheckinMethod"[]
    USING (
      CASE
        WHEN cardinality(array_remove("enabledMethods"::text[], 'SIMPLE')) = 0
          THEN ARRAY['SCREEN_QR', 'RECEPTION_APPROVAL']
        ELSE array_remove("enabledMethods"::text[], 'SIMPLE')
      END
    )::"CheckinMethod"[],
  ALTER COLUMN "enabledMethods"
    SET DEFAULT ARRAY['SCREEN_QR', 'RECEPTION_APPROVAL']::"CheckinMethod"[];

DROP TYPE "CheckinMethod_old";
