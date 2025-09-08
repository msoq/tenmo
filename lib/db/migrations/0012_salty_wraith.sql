CREATE TABLE IF NOT EXISTS "UserPreferences" (
	"userId" uuid PRIMARY KEY NOT NULL,
	"activeFromLanguage" varchar(10) NOT NULL,
	"activeToLanguage" varchar(10) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Topics" ALTER COLUMN "fromLanguage" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "Topics" ALTER COLUMN "toLanguage" DROP DEFAULT;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
