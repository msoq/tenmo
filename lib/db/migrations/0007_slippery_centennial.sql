CREATE TABLE IF NOT EXISTS "UserPhrasesSettings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"fromLanguage" varchar(50) NOT NULL,
	"toLanguage" varchar(50) NOT NULL,
	"topic" varchar(200) NOT NULL,
	"count" integer NOT NULL,
	"instruction" text,
	"level" varchar NOT NULL,
	"phraseLength" integer NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPhrasesSettings" ADD CONSTRAINT "UserPhrasesSettings_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "userPhrasesSettings_userId_unique" ON "UserPhrasesSettings" USING btree ("userId");