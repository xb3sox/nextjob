ALTER TABLE "account" ADD COLUMN "issuer" text;--> statement-breakpoint
UPDATE "account"
SET "issuer" = CASE "provider_id"
	WHEN 'credential' THEN 'local:credential'
	WHEN 'google' THEN 'https://accounts.google.com'
	WHEN 'apple' THEN 'https://appleid.apple.com'
	WHEN 'github' THEN 'local:oauth:github'
	ELSE 'local:oauth:' || replace(replace("provider_id", '%', '%25'), '/', '%2F')
END
WHERE "issuer" IS NULL;--> statement-breakpoint
UPDATE "account"
SET "account_id" = "user_id"
WHERE "provider_id" = 'credential';--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "issuer" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account" USING btree ("issuer","account_id");
