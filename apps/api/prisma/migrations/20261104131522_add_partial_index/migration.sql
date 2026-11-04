-- Impede que um utilizador tenha mais do que uma sessão aberta (exitAt nulo)
CREATE UNIQUE INDEX one_open_session_per_user
  ON "Session" ("userId")
  WHERE "exitAt" IS NULL;