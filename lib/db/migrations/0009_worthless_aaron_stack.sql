-- Create join table for UserPhrasesSettings ↔ Topics
BEGIN;

CREATE TABLE IF NOT EXISTS "UserPhrasesSettingsTopic" (
  "settingsId" uuid NOT NULL,
  "topicId" uuid NOT NULL,
  CONSTRAINT "UserPhrasesSettingsTopic_pk" PRIMARY KEY ("settingsId", "topicId"),
  CONSTRAINT "UserPhrasesSettingsTopic_settingsId_fkey"
    FOREIGN KEY ("settingsId") REFERENCES "UserPhrasesSettings"("id") ON DELETE CASCADE,
  CONSTRAINT "UserPhrasesSettingsTopic_topicId_fkey"
    FOREIGN KEY ("topicId") REFERENCES "Topics"("id")
);

CREATE INDEX IF NOT EXISTS "UserPhrasesSettingsTopic_settingsId_idx"
  ON "UserPhrasesSettingsTopic" ("settingsId");

-- Backfill from legacy CSV column "topic" in UserPhrasesSettings
WITH tokens AS (
  SELECT
    ups.id AS settingsId,
    trim(token) AS token
  FROM "UserPhrasesSettings" ups
  CROSS JOIN LATERAL string_to_array(COALESCE(ups."topic", ''), ',') AS token
)
INSERT INTO "UserPhrasesSettingsTopic" ("settingsId", "topicId")
SELECT
  t.settingsId,
  (t.token)::uuid AS topicId
FROM tokens t
JOIN "Topics" tp ON tp.id = (t.token)::uuid
WHERE t.token <> ''
  AND t.token ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
ON CONFLICT DO NOTHING;

COMMIT;


