CREATE TABLE "application_event" (
	"id" text PRIMARY KEY NOT NULL,
	"application_id" text NOT NULL,
	"user_id" text NOT NULL,
	"from_status" text NOT NULL,
	"to_status" text NOT NULL,
	"actor" text DEFAULT 'user' NOT NULL,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval_checkpoint" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"application_id" text,
	"target_type" text NOT NULL,
	"question_or_summary" text NOT NULL,
	"proposed_payload" jsonb NOT NULL,
	"payload_hash" text NOT NULL,
	"decision" text DEFAULT 'pending' NOT NULL,
	"decided_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_event" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"details" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_claim" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"evidence_id" text,
	"evidence_source" text,
	"confidence" real DEFAULT 0.85 NOT NULL,
	"verification_status" text DEFAULT 'unverified' NOT NULL,
	"verification_notes" text,
	"verified_at" timestamp,
	"previous_version_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"source_type" text NOT NULL,
	"file_name" text,
	"mime_type" text,
	"content_hash" text NOT NULL,
	"raw_text" text,
	"extracted_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "career_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"target_roles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"locations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"work_mode" text DEFAULT 'any' NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"salary_currency" text DEFAULT 'USD' NOT NULL,
	"seniority_levels" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"employment_types" jsonb DEFAULT '["full-time"]'::jsonb NOT NULL,
	"excluded_companies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"excluded_keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"must_have_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "career_preference_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "career_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"headline" text,
	"summary" text,
	"location_country" text,
	"location_city" text,
	"location_state" text,
	"willing_to_relocate" boolean DEFAULT false NOT NULL,
	"work_authorizations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"needs_sponsorship" boolean DEFAULT false NOT NULL,
	"security_clearance" text,
	"automation_mode" text DEFAULT 'assist' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "career_profile_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "career_revision" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"claim_id" text NOT NULL,
	"version" integer NOT NULL,
	"action" text NOT NULL,
	"previous_snapshot" jsonb,
	"new_snapshot" jsonb NOT NULL,
	"actor" text DEFAULT 'user' NOT NULL,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_application" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"job_id" text NOT NULL,
	"document_id" text,
	"status" text DEFAULT 'Saved' NOT NULL,
	"machine_state" text DEFAULT 'DISCOVERED' NOT NULL,
	"submission_mode" text DEFAULT 'manual' NOT NULL,
	"source_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"notes" text,
	"submitted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_application_user_job_unique" UNIQUE("user_id","job_id")
);
--> statement-breakpoint
CREATE TABLE "job_listing" (
	"id" text PRIMARY KEY NOT NULL,
	"source_id" text,
	"source_name" text NOT NULL,
	"external_id" text,
	"fingerprint" text NOT NULL,
	"canonical_job_id" text,
	"title" text NOT NULL,
	"company_name" text NOT NULL,
	"location_country" text DEFAULT 'Remote' NOT NULL,
	"location_city" text,
	"location_state" text,
	"remote" boolean DEFAULT false NOT NULL,
	"work_mode" text DEFAULT 'remote' NOT NULL,
	"seniority_level" text DEFAULT 'senior' NOT NULL,
	"employment_type" text DEFAULT 'full-time' NOT NULL,
	"role_family" text DEFAULT 'Engineering' NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"salary_currency" text DEFAULT 'USD' NOT NULL,
	"description" text NOT NULL,
	"required_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"preferred_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"minimum_years_experience" integer,
	"minimum_degree" text,
	"visa_sponsorship" boolean DEFAULT false NOT NULL,
	"source_url" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"freshness_score" real DEFAULT 1 NOT NULL,
	"posted_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_source" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"adapter_type" text NOT NULL,
	"base_url" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_evaluation" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"job_id" text NOT NULL,
	"eligibility_status" text NOT NULL,
	"eligibility_checks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"match_score" integer NOT NULL,
	"match_status" text NOT NULL,
	"confidence" real NOT NULL,
	"matched_claim_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"strengths" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"missing_required" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"missing_preferred" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"explanation" text NOT NULL,
	"profile_version" integer DEFAULT 1 NOT NULL,
	"evaluated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reusable_answer" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"question_pattern" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"answer" text NOT NULL,
	"evidence_claim_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_job" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"job_id" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "saved_job_user_job_unique" UNIQUE("user_id","job_id")
);
--> statement-breakpoint
CREATE TABLE "submission_receipt" (
	"id" text PRIMARY KEY NOT NULL,
	"receipt_id" text NOT NULL,
	"application_id" text NOT NULL,
	"user_id" text NOT NULL,
	"job_version" text NOT NULL,
	"field_hashes" jsonb NOT NULL,
	"answer_hashes" jsonb NOT NULL,
	"confirmation_evidence_id" text,
	"verification_status" text NOT NULL,
	"content_hash" text NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "submission_receipt_receipt_id_unique" UNIQUE("receipt_id")
);
--> statement-breakpoint
CREATE TABLE "tailored_document" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"job_id" text,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"content" text NOT NULL,
	"sections" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evidence_traceability" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_snapshot_hash" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_event" ADD CONSTRAINT "application_event_application_id_job_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."job_application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_event" ADD CONSTRAINT "application_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_checkpoint" ADD CONSTRAINT "approval_checkpoint_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_checkpoint" ADD CONSTRAINT "approval_checkpoint_application_id_job_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."job_application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_claim" ADD CONSTRAINT "career_claim_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_claim" ADD CONSTRAINT "career_claim_evidence_id_career_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."career_evidence"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_evidence" ADD CONSTRAINT "career_evidence_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_preference" ADD CONSTRAINT "career_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_profile" ADD CONSTRAINT "career_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "career_revision" ADD CONSTRAINT "career_revision_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_job_id_job_listing_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_document_id_tailored_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."tailored_document"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_listing" ADD CONSTRAINT "job_listing_source_id_job_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."job_source"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_evaluation" ADD CONSTRAINT "match_evaluation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_evaluation" ADD CONSTRAINT "match_evaluation_job_id_job_listing_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reusable_answer" ADD CONSTRAINT "reusable_answer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_job" ADD CONSTRAINT "saved_job_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_job" ADD CONSTRAINT "saved_job_job_id_job_listing_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listing"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_receipt" ADD CONSTRAINT "submission_receipt_application_id_job_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."job_application"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_receipt" ADD CONSTRAINT "submission_receipt_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailored_document" ADD CONSTRAINT "tailored_document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tailored_document" ADD CONSTRAINT "tailored_document_job_id_job_listing_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."job_listing"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_event_applicationId_idx" ON "application_event" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "approval_checkpoint_userId_idx" ON "approval_checkpoint" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_event_userId_idx" ON "audit_event" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "career_claim_userId_idx" ON "career_claim" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "career_claim_type_idx" ON "career_claim" USING btree ("type");--> statement-breakpoint
CREATE INDEX "career_claim_status_idx" ON "career_claim" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "career_evidence_userId_idx" ON "career_evidence" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "career_preference_userId_idx" ON "career_preference" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "career_profile_userId_idx" ON "career_profile" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "career_revision_userId_idx" ON "career_revision" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "career_revision_claimId_idx" ON "career_revision" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "job_application_userId_idx" ON "job_application" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_application_status_idx" ON "job_application" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_listing_fingerprint_idx" ON "job_listing" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX "job_listing_status_idx" ON "job_listing" USING btree ("status");--> statement-breakpoint
CREATE INDEX "match_evaluation_userId_idx" ON "match_evaluation" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "match_evaluation_jobId_idx" ON "match_evaluation" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "reusable_answer_userId_idx" ON "reusable_answer" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "saved_job_userId_idx" ON "saved_job" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "submission_receipt_applicationId_idx" ON "submission_receipt" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "tailored_document_userId_idx" ON "tailored_document" USING btree ("user_id");