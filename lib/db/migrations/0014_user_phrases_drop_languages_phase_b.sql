-- Phase B: Drop language columns from UserPhrasesSettings
-- Ensure the application has been updated to read languages from UserPreferences only

ALTER TABLE "UserPhrasesSettings"
  DROP COLUMN IF EXISTS "fromLanguage",
  DROP COLUMN IF EXISTS "toLanguage";


