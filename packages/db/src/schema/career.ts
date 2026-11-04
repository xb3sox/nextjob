import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { generateId } from "@workspace/shared/utils";

import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "../lib/zod";
import { user } from "./auth";

import type * as z from "zod";

export const careerClaimTypes = [
  "experience",
  "education",
  "skill",
  "project",
  "certification",
  "achievement",
  "language",
  "summary",
] as const;

export type CareerClaimType = (typeof careerClaimTypes)[number];

export const verificationStatuses = [
  "unverified",
  "verified",
  "rejected",
  "pending_review",
] as const;

export type ClaimVerificationStatus = (typeof verificationStatuses)[number];

export const careerProfile = pgTable(
  "career_profile",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    headline: text(),
    summary: text(),
    locationCountry: text("location_country"),
    locationCity: text("location_city"),
    locationState: text("location_state"),
    willingToRelocate: boolean("willing_to_relocate").notNull().default(false),
    workAuthorizations: jsonb("work_authorizations")
      .$type<string[]>()
      .notNull()
      .default([]),
    needsSponsorship: boolean("needs_sponsorship").notNull().default(false),
    securityClearance: text("security_clearance"),
    automationMode: text("automation_mode")
      .$type<"assist" | "approve_and_apply" | "bounded_autopilot">()
      .notNull()
      .default("assist"),
    version: integer().notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("career_profile_userId_idx").on(t.userId)],
);

export const careerEvidence = pgTable(
  "career_evidence",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    sourceType: text("source_type")
      .$type<"pdf" | "docx" | "json_resume" | "manual" | "conversational">()
      .notNull(),
    fileName: text("file_name"),
    mimeType: text("mime_type"),
    contentHash: text("content_hash").notNull(),
    rawText: text("raw_text"),
    extractedData: jsonb("extracted_data").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("career_evidence_userId_idx").on(t.userId)],
);

export const careerClaim = pgTable(
  "career_claim",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text().$type<CareerClaimType>().notNull(),
    title: text().notNull(),
    description: text(),
    content: jsonb()
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    evidenceId: text("evidence_id").references(() => careerEvidence.id, {
      onDelete: "set null",
    }),
    evidenceSource: text("evidence_source"),
    confidence: real().notNull().default(0.85),
    verificationStatus: text("verification_status")
      .$type<ClaimVerificationStatus>()
      .notNull()
      .default("unverified"),
    verificationNotes: text("verification_notes"),
    verifiedAt: timestamp("verified_at"),
    previousVersionId: text("previous_version_id"),
    version: integer().notNull().default(1),
    archived: boolean().notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("career_claim_userId_idx").on(t.userId),
    index("career_claim_type_idx").on(t.type),
    index("career_claim_status_idx").on(t.verificationStatus),
  ],
);

export const careerRevision = pgTable(
  "career_revision",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    claimId: text("claim_id").notNull(),
    version: integer().notNull(),
    action: text()
      .$type<
        | "imported"
        | "created"
        | "updated"
        | "verified"
        | "rejected"
        | "archived"
        | "conversational_approved"
      >()
      .notNull(),
    previousSnapshot: jsonb("previous_snapshot").$type<Record<string, unknown>>(),
    newSnapshot: jsonb("new_snapshot")
      .$type<Record<string, unknown>>()
      .notNull(),
    actor: text().notNull().default("user"),
    reason: text(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("career_revision_userId_idx").on(t.userId),
    index("career_revision_claimId_idx").on(t.claimId),
  ],
);

export const careerPreference = pgTable(
  "career_preference",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    targetRoles: jsonb("target_roles").$type<string[]>().notNull().default([]),
    locations: jsonb("locations").$type<string[]>().notNull().default([]),
    workMode: text("work_mode")
      .$type<"remote" | "hybrid" | "on-site" | "any">()
      .notNull()
      .default("any"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: text("salary_currency").notNull().default("USD"),
    seniorityLevels: jsonb("seniority_levels")
      .$type<string[]>()
      .notNull()
      .default([]),
    employmentTypes: jsonb("employment_types")
      .$type<string[]>()
      .notNull()
      .default(["full-time"]),
    excludedCompanies: jsonb("excluded_companies")
      .$type<string[]>()
      .notNull()
      .default([]),
    excludedKeywords: jsonb("excluded_keywords")
      .$type<string[]>()
      .notNull()
      .default([]),
    mustHaveSkills: jsonb("must_have_skills")
      .$type<string[]>()
      .notNull()
      .default([]),
    version: integer().notNull().default(1),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("career_preference_userId_idx").on(t.userId)],
);

export const jobSource = pgTable("job_source", {
  id: text().primaryKey().$defaultFn(generateId),
  name: text().notNull(),
  adapterType: text("adapter_type")
    .$type<"remotive" | "greenhouse" | "lever" | "curated">()
    .notNull(),
  baseUrl: text("base_url").notNull(),
  enabled: boolean().notNull().default(true),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const jobListing = pgTable(
  "job_listing",
  {
    id: text().primaryKey().$defaultFn(generateId),
    sourceId: text("source_id").references(() => jobSource.id, {
      onDelete: "set null",
    }),
    sourceName: text("source_name").notNull(),
    externalId: text("external_id"),
    fingerprint: text().notNull(),
    canonicalJobId: text("canonical_job_id"),
    title: text().notNull(),
    companyName: text("company_name").notNull(),
    locationCountry: text("location_country").notNull().default("Remote"),
    locationCity: text("location_city"),
    locationState: text("location_state"),
    remote: boolean().notNull().default(false),
    workMode: text("work_mode")
      .$type<"remote" | "hybrid" | "on-site" | "any">()
      .notNull()
      .default("remote"),
    seniorityLevel: text("seniority_level")
      .$type<"entry" | "mid" | "senior" | "lead" | "executive">()
      .notNull()
      .default("senior"),
    employmentType: text("employment_type").notNull().default("full-time"),
    roleFamily: text("role_family").notNull().default("Engineering"),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    salaryCurrency: text("salary_currency").notNull().default("USD"),
    description: text().notNull(),
    requiredSkills: jsonb("required_skills")
      .$type<string[]>()
      .notNull()
      .default([]),
    preferredSkills: jsonb("preferred_skills")
      .$type<string[]>()
      .notNull()
      .default([]),
    minimumYearsExperience: integer("minimum_years_experience"),
    minimumDegree: text("minimum_degree"),
    visaSponsorship: boolean("visa_sponsorship").notNull().default(false),
    sourceUrl: text("source_url").notNull(),
    status: text()
      .$type<"active" | "expired" | "unknown">()
      .notNull()
      .default("active"),
    freshnessScore: real("freshness_score").notNull().default(1.0),
    postedAt: timestamp("posted_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("job_listing_fingerprint_idx").on(t.fingerprint),
    index("job_listing_status_idx").on(t.status),
  ],
);

export const savedJob = pgTable(
  "saved_job",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobListing.id, { onDelete: "cascade" }),
    notes: text(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    unique("saved_job_user_job_unique").on(t.userId, t.jobId),
    index("saved_job_userId_idx").on(t.userId),
  ],
);

export const matchEvaluation = pgTable(
  "match_evaluation",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobListing.id, { onDelete: "cascade" }),
    eligibilityStatus: text("eligibility_status")
      .$type<"eligible" | "ineligible" | "unknown">()
      .notNull(),
    eligibilityChecks: jsonb("eligibility_checks")
      .$type<Array<Record<string, unknown>>>()
      .notNull()
      .default([]),
    matchScore: integer("match_score").notNull(),
    matchStatus: text("match_status")
      .$type<"excellent" | "good" | "weak" | "none">()
      .notNull(),
    confidence: real().notNull(),
    matchedClaimIds: jsonb("matched_claim_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    strengths: jsonb().$type<string[]>().notNull().default([]),
    missingRequired: jsonb("missing_required")
      .$type<string[]>()
      .notNull()
      .default([]),
    missingPreferred: jsonb("missing_preferred")
      .$type<string[]>()
      .notNull()
      .default([]),
    explanation: text().notNull(),
    profileVersion: integer("profile_version").notNull().default(1),
    evaluatedAt: timestamp("evaluated_at").notNull().defaultNow(),
  },
  (t) => [
    index("match_evaluation_userId_idx").on(t.userId),
    index("match_evaluation_jobId_idx").on(t.jobId),
  ],
);

export const tailoredDocument = pgTable(
  "tailored_document",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    jobId: text("job_id").references(() => jobListing.id, {
      onDelete: "set null",
    }),
    kind: text().$type<"cv" | "resume" | "cover_letter">().notNull(),
    title: text().notNull(),
    locale: text().notNull().default("en"),
    content: text().notNull(),
    sections: jsonb()
      .$type<Array<Record<string, unknown>>>()
      .notNull()
      .default([]),
    evidenceTraceability: jsonb("evidence_traceability")
      .$type<Array<Record<string, unknown>>>()
      .notNull()
      .default([]),
    sourceSnapshotHash: text("source_snapshot_hash").notNull(),
    version: integer().notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("tailored_document_userId_idx").on(t.userId)],
);

export const applicationTrackerStatuses = [
  "Saved",
  "Preparing",
  "Needs Approval",
  "Ready",
  "Submitting",
  "Submission Uncertain",
  "Confirmed",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn",
  "Failed",
] as const;

export type ApplicationTrackerStatus =
  (typeof applicationTrackerStatuses)[number];

export const jobApplication = pgTable(
  "job_application",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    jobId: text("job_id")
      .notNull()
      .references(() => jobListing.id, { onDelete: "cascade" }),
    documentId: text("document_id").references(() => tailoredDocument.id, {
      onDelete: "set null",
    }),
    status: text()
      .$type<ApplicationTrackerStatus>()
      .notNull()
      .default("Saved"),
    machineState: text("machine_state").notNull().default("DISCOVERED"),
    submissionMode: text("submission_mode")
      .$type<"manual" | "assisted" | "automated">()
      .notNull()
      .default("manual"),
    sourceSnapshot: jsonb("source_snapshot")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    answers: jsonb().$type<Record<string, string>>().notNull().default({}),
    notes: text(),
    submittedAt: timestamp("submitted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    unique("job_application_user_job_unique").on(t.userId, t.jobId),
    index("job_application_userId_idx").on(t.userId),
    index("job_application_status_idx").on(t.status),
  ],
);

export const applicationEvent = pgTable(
  "application_event",
  {
    id: text().primaryKey().$defaultFn(generateId),
    applicationId: text("application_id")
      .notNull()
      .references(() => jobApplication.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    fromStatus: text("from_status").notNull(),
    toStatus: text("to_status").notNull(),
    actor: text().notNull().default("user"),
    reason: text(),
    metadata: jsonb().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("application_event_applicationId_idx").on(t.applicationId)],
);

export const submissionReceiptTable = pgTable(
  "submission_receipt",
  {
    id: text().primaryKey().$defaultFn(generateId),
    receiptId: text("receipt_id").notNull().unique(),
    applicationId: text("application_id")
      .notNull()
      .references(() => jobApplication.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    jobVersion: text("job_version").notNull(),
    fieldHashes: jsonb("field_hashes")
      .$type<Record<string, string>>()
      .notNull(),
    answerHashes: jsonb("answer_hashes").$type<string[]>().notNull(),
    confirmationEvidenceId: text("confirmation_evidence_id"),
    verificationStatus: text("verification_status")
      .$type<"unverified" | "verified">()
      .notNull(),
    contentHash: text("content_hash").notNull(),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  },
  (t) => [index("submission_receipt_applicationId_idx").on(t.applicationId)],
);

export const reusableAnswer = pgTable(
  "reusable_answer",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    questionPattern: text("question_pattern").notNull(),
    category: text().notNull().default("general"),
    answer: text().notNull(),
    evidenceClaimIds: jsonb("evidence_claim_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("reusable_answer_userId_idx").on(t.userId)],
);

export const approvalCheckpoint = pgTable(
  "approval_checkpoint",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    applicationId: text("application_id").references(() => jobApplication.id, {
      onDelete: "cascade",
    }),
    targetType: text("target_type")
      .$type<"application_submission" | "career_claim_update" | "high_risk_field">()
      .notNull(),
    questionOrSummary: text("question_or_summary").notNull(),
    proposedPayload: jsonb("proposed_payload")
      .$type<Record<string, unknown>>()
      .notNull(),
    payloadHash: text("payload_hash").notNull(),
    decision: text()
      .$type<"pending" | "approved" | "edited" | "rejected">()
      .notNull()
      .default("pending"),
    decidedAt: timestamp("decided_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("approval_checkpoint_userId_idx").on(t.userId)],
);

export const auditEvent = pgTable(
  "audit_event",
  {
    id: text().primaryKey().$defaultFn(generateId),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text().notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    details: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("audit_event_userId_idx").on(t.userId)],
);

export const careerProfileRelations = relations(careerProfile, ({ one }) => ({
  user: one(user, {
    fields: [careerProfile.userId],
    references: [user.id],
  }),
}));

export const insertCareerClaimSchema = createInsertSchema(careerClaim);
export const selectCareerClaimSchema = createSelectSchema(careerClaim);
export const updateCareerClaimSchema = createUpdateSchema(careerClaim);

export const insertCareerPreferenceSchema = createInsertSchema(careerPreference);
export const selectCareerPreferenceSchema = createSelectSchema(careerPreference);
export const updateCareerPreferenceSchema = createUpdateSchema(careerPreference);

export const insertJobListingSchema = createInsertSchema(jobListing);
export const selectJobListingSchema = createSelectSchema(jobListing);

export const insertJobApplicationSchema = createInsertSchema(jobApplication);
export const selectJobApplicationSchema = createSelectSchema(jobApplication);
export const updateJobApplicationSchema = createUpdateSchema(jobApplication);

export type SelectCareerClaim = z.infer<typeof selectCareerClaimSchema>;
export type InsertCareerClaim = z.infer<typeof insertCareerClaimSchema>;
export type SelectCareerPreference = z.infer<typeof selectCareerPreferenceSchema>;
export type SelectJobListing = z.infer<typeof selectJobListingSchema>;
export type SelectJobApplication = z.infer<typeof selectJobApplicationSchema>;
