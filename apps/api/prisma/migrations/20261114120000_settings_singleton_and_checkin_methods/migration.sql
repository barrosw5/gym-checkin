-- Check-in methods become an enum: a typo in enabledMethods is now a DB error
CREATE TYPE "CheckinMethod" AS ENUM ('SIMPLE', 'SCREEN_QR', 'RECEPTION_APPROVAL');

-- Convert in place instead of DROP/ADD (what `prisma migrate diff` generates),
-- so an existing row keeps its values. Fails loudly if a value is not a method.
ALTER TABLE "Settings"
  ALTER COLUMN "enabledMethods" SET DATA TYPE "CheckinMethod"[]
    USING "enabledMethods"::text[]::"CheckinMethod"[],
  ALTER COLUMN "enabledMethods" SET DEFAULT ARRAY['SIMPLE']::"CheckinMethod"[];

-- Rules Prisma's schema cannot express (it ignores CHECK constraints):
--  * singleton: the only allowed id is 'global', so there is never a 2nd row
--  * no nonsense values (capacity 0, auto-close after 0 h, empty QR window)
--  * enabledMethods is never NULL (Prisma maps lists to nullable columns)
ALTER TABLE "Settings"
  ADD CONSTRAINT "settings_singleton" CHECK ("id" = 'global'),
  ADD CONSTRAINT "settings_positive_values"
    CHECK ("capacity" > 0 AND "autoCloseHours" > 0 AND "qrWindowSeconds" > 0),
  ADD CONSTRAINT "settings_enabled_methods_not_null"
    CHECK ("enabledMethods" IS NOT NULL);

-- Every environment gets the row on deploy (Render runs `migrate deploy`),
-- without depending on the seed. ON CONFLICT: keep a row that already exists.
INSERT INTO "Settings" ("id") VALUES ('global')
ON CONFLICT ("id") DO NOTHING;
