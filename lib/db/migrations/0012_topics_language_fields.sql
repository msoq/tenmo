-- Add language fields to Topics table
-- Phase 2A: Language filtering support

-- Add columns with defaults
ALTER TABLE "Topics" ADD COLUMN "fromLanguage" VARCHAR(10) DEFAULT 'en';
ALTER TABLE "Topics" ADD COLUMN "toLanguage" VARCHAR(10) DEFAULT 'es';

-- Backfill existing data (all topics get en->es by default)
UPDATE "Topics" SET "fromLanguage" = 'en', "toLanguage" = 'es' WHERE "fromLanguage" IS NULL;

-- Make columns NOT NULL
ALTER TABLE "Topics" ALTER COLUMN "fromLanguage" SET NOT NULL;
ALTER TABLE "Topics" ALTER COLUMN "toLanguage" SET NOT NULL;

-- Add composite index for efficient language + owner filtering
CREATE INDEX "idx_topics_lang_owner_active" 
ON "Topics" ("fromLanguage", "toLanguage", "createdByUserId", "isActive");
