-- Add index to speed up queries scoped by owner
CREATE INDEX IF NOT EXISTS "idx_topics_createdByUserId"
ON "Topics" ("createdByUserId");


