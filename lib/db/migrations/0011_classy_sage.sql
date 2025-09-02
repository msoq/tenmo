ALTER TABLE "Topics" ADD COLUMN "fromLanguage" varchar(10) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "Topics" ADD COLUMN "toLanguage" varchar(10) DEFAULT 'es' NOT NULL;