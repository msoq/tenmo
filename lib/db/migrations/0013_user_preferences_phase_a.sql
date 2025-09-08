-- Create UserPreferences table (one row per user)
CREATE TABLE IF NOT EXISTS "UserPreferences" (
  "userId" uuid PRIMARY KEY REFERENCES "User"("id") ON DELETE CASCADE,
  "activeFromLanguage" varchar(10) NOT NULL,
  "activeToLanguage" varchar(10) NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- Backfill from existing UserPhrasesSettings if preferences not present
INSERT INTO "UserPreferences" ("userId", "activeFromLanguage", "activeToLanguage")
SELECT ups."userId", ups."fromLanguage", ups."toLanguage"
FROM "UserPhrasesSettings" ups
LEFT JOIN "UserPreferences" up ON up."userId" = ups."userId"
WHERE up."userId" IS NULL;

-- No destructive changes yet (Phase A). Phase B will drop columns.


