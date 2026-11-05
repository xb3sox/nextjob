import * as z from "zod";

export const claimCategorySchema = z.enum([
  "summary",
  "experience",
  "education",
  "skill",
  "project",
  "certification",
  "achievement",
  "recommendation",
  "portfolio",
  "language",
]);

export const verificationStatusSchema = z.enum([
  "unverified",
  "pending_review",
  "verified",
  "disputed",
  "rejected",
  "archived",
]);

export const workModeSchema = z.enum(["remote", "hybrid", "on-site", "any"]);

export const eligibilityStatusSchema = z.enum([
  "eligible",
  "ineligible",
  "unknown",
]);

export const applicationUiStatusSchema = z.enum([
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
]);

export const applicationInternalStateSchema = z.enum([
  "DISCOVERED",
  "ELIGIBLE",
  "INELIGIBLE",
  "ELIGIBILITY_UNKNOWN",
  "SAVED",
  "TAILORING",
  "READY_FOR_REVIEW",
  "APPROVED_TO_SUBMIT",
  "SUBMITTING",
  "SUBMITTED_UNVERIFIED",
  "SUBMITTED_VERIFIED",
  "RECRUITER_RESPONSE",
  "ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
  "ARCHIVED",
  "FAILED",
]);

export const careerConflictDiffSchema = z.object({
  field: z.string(),
  existingValue: z.string(),
  proposedValue: z.string(),
});

export const careerClaimItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  profileId: z.string(),
  evidenceId: z.string().nullable(),
  category: claimCategorySchema,
  title: z.string(),
  organization: z.string().nullable(),
  location: z.string().nullable(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  isCurrent: z.boolean(),
  description: z.string(),
  skills: z.array(z.string()),
  metrics: z.array(z.string()),
  verificationStatus: verificationStatusSchema,
  confidence: z.number(),
  conflictWithClaimId: z.string().nullable(),
  conflictDetails: z
    .object({
      existingClaimId: z.string(),
      reason: z.string(),
      differences: z.array(careerConflictDiffSchema),
    })
    .nullable(),
  updatedAt: z.string(),
});

export const careerEvidenceItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.enum([
    "resume_pdf",
    "resume_docx",
    "resume_text",
    "json_resume",
    "portfolio_url",
    "certificate",
    "manual_entry",
    "conversational_update",
  ]),
  title: z.string(),
  fileName: z.string().nullable(),
  contentHash: z.string(),
  extractedFactCount: z.number(),
  conflictCount: z.number(),
  importedAt: z.string(),
});

export const careerRevisionItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  claimId: z.string().nullable(),
  action: z.string(),
  actor: z.string(),
  reason: z.string().nullable(),
  previousValue: z.record(z.string(), z.unknown()).nullable(),
  newValue: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

export const careerPreferencesSchema = z.object({
  targetRoles: z.array(z.string()),
  locations: z.array(z.string()),
  workModes: z.array(workModeSchema),
  minSalary: z.number().nullable(),
  maxSalary: z.number().nullable(),
  currency: z.string(),
  seniorityLevels: z.array(z.string()),
  employmentTypes: z.array(z.string()),
  excludedCompanies: z.array(z.string()),
  excludedKeywords: z.array(z.string()),
  requireApprovalBeforeSubmit: z.boolean(),
  requireApprovalForProfileChanges: z.boolean(),
  workAuthorizationCountries: z.array(z.string()),
  requiresSponsorship: z.boolean(),
  automationMode: z
    .enum(["review_first", "auto_apply"])
    .default("review_first"),
  autoApplyMinMatchScore: z.number().default(85),
  dailyApplicationCap: z.number().default(15),
  autoApplyKeywords: z.array(z.string()).default([]),
});

export const reusableAnswerItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  questionCategory: z.string(),
  questionPattern: z.string(),
  verifiedAnswer: z.string(),
  isApprovedForReuse: z.boolean(),
  updatedAt: z.string(),
});

export const importCareerPayloadSchema = z.object({
  format: z.enum(["text", "pdf", "docx", "json_resume"]),
  fileName: z.string().optional(),
  content: z.string().min(1),
});

export const verifyClaimPayloadSchema = z.object({
  claimId: z.string().min(1),
  action: z.enum([
    "confirm",
    "edit",
    "reject",
    "mark_unverified",
    "archive",
    "resolve_conflict_keep_existing",
    "resolve_conflict_accept_proposed",
  ]),
  reason: z.string().optional(),
  updates: z
    .object({
      title: z.string().optional(),
      organization: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      startDate: z.string().nullable().optional(),
      endDate: z.string().nullable().optional(),
      isCurrent: z.boolean().optional(),
      description: z.string().optional(),
      skills: z.array(z.string()).optional(),
      metrics: z.array(z.string()).optional(),
    })
    .optional(),
});

export const createManualClaimPayloadSchema = z.object({
  category: claimCategorySchema,
  title: z.string().min(1),
  organization: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean().optional(),
  description: z.string().min(1),
  skills: z.array(z.string()).optional(),
  metrics: z.array(z.string()).optional(),
});

export const conversationalUpdatePayloadSchema = z.object({
  message: z.string().min(3),
});

export const upsertReusableAnswerPayloadSchema = z.object({
  id: z.string().optional(),
  questionCategory: z.string().min(1),
  questionPattern: z.string().min(1),
  verifiedAnswer: z.string().min(1),
  isApprovedForReuse: z.boolean().default(true),
});

export const jobFitQuestionAnalysisSchema = z.object({
  whyMatches: z.array(z.string()),
  requirementsMet: z.array(z.string()),
  missingRequired: z.array(z.string()),
  missingPreferred: z.array(z.string()),
  credibility: z.object({
    isCredible: z.boolean(),
    sourceName: z.string(),
    sourceAttributionUrl: z.string(),
    freshnessScore: z.number(),
    status: z.enum(["active", "expired"]),
    hasSalaryTransparency: z.boolean(),
    signals: z.array(z.string()),
  }),
  applicationProcess: z.object({
    eligibilityStatus: eligibilityStatusSchema,
    blockingReasons: z.array(z.string()),
    unknownReasons: z.array(z.string()),
    executionMode: z.enum(["manual_review_required", "assisted_with_approval"]),
    steps: z.array(z.string()),
  }),
});

export const jobWithFitSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  sourceName: z.string(),
  sourceUrl: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  workMode: workModeSchema,
  employmentType: z.string(),
  seniorityLevel: z.string().nullable(),
  salaryMin: z.number().nullable(),
  salaryMax: z.number().nullable(),
  salaryCurrency: z.string().nullable(),
  description: z.string(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  requiredExperienceYears: z.number().nullable(),
  requiredEducation: z.string().nullable(),
  sponsorshipAvailable: z.boolean().nullable(),
  allowedCountries: z.array(z.string()),
  fingerprint: z.string(),
  canonicalJobId: z.string().nullable(),
  duplicateOfIds: z.array(z.string()),
  status: z.enum(["active", "expired"]),
  freshnessScore: z.number(),
  postedAt: z.string(),
  isSaved: z.boolean(),
  overallScore: z.number(),
  recommendation: z.enum([
    "strong_match",
    "good_match",
    "stretch_match",
    "low_match",
    "ineligible",
  ]),
  eligibilityStatus: eligibilityStatusSchema,
  fitAnalysis: jobFitQuestionAnalysisSchema,
});

export const tailoredStatementSchema = z.object({
  id: z.string(),
  section: z.enum(["summary", "experience", "skills", "projects", "education"]),
  originalText: z.string(),
  proposedText: z.string(),
  sourceClaimIds: z.array(z.string()),
  confidence: z.number(),
  status: z.enum(["accepted", "edited", "rejected", "pending"]),
  relevanceReason: z.string(),
});

export const tailoredDocumentItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobId: z.string(),
  title: z.string(),
  language: z.enum(["en", "ar"]),
  targetRole: z.string(),
  targetCompany: z.string(),
  summary: z.string(),
  statements: z.array(tailoredStatementSchema),
  coverLetter: z.string().nullable(),
  sourceClaimIds: z.array(z.string()),
  unsupportedClaimCount: z.number(),
  validationPassed: z.boolean(),
  payloadHash: z.string(),
  status: z.enum(["draft", "pending_review", "approved", "exported"]),
  approvedAt: z.string().nullable(),
  updatedAt: z.string(),
});

export const generateTailoredDocumentPayloadSchema = z.object({
  jobId: z.string().min(1),
  language: z.enum(["en", "ar"]).default("en"),
  includeCoverLetter: z.boolean().default(true),
});

export const updateTailoredStatementPayloadSchema = z.object({
  documentId: z.string().min(1),
  statementId: z.string().min(1),
  action: z.enum(["accept", "edit", "reject"]),
  editedText: z.string().optional(),
});

export const submissionReceiptSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  userId: z.string(),
  jobId: z.string(),
  tailoredDocumentId: z.string().nullable(),
  verificationStatus: z.enum(["SUBMITTED_VERIFIED", "SUBMITTED_UNVERIFIED"]),
  confirmationCode: z.string().nullable(),
  confirmationText: z.string().nullable(),
  submittedUrl: z.string().nullable(),
  payloadHash: z.string(),
  receiptHash: z.string(),
  submittedAt: z.string(),
});

export const applicationEventItemSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  fromState: z.string().nullable(),
  toState: z.string(),
  actor: z.string(),
  reason: z.string(),
  createdAt: z.string(),
});

export const applicationItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  jobId: z.string(),
  tailoredDocumentId: z.string().nullable(),
  company: z.string(),
  roleTitle: z.string(),
  sourceUrl: z.string(),
  uiStatus: applicationUiStatusSchema,
  internalState: applicationInternalStateSchema,
  approvedPayloadHash: z.string().nullable(),
  approvedAt: z.string().nullable(),
  approvedByUserId: z.string().nullable(),
  submittedAt: z.string().nullable(),
  uncertaintyReason: z.string().nullable(),
  followUpDueAt: z.string().nullable(),
  interviewScheduledAt: z.string().nullable(),
  offerDetails: z
    .object({
      baseSalary: z.number().optional(),
      currency: z.string().optional(),
      equity: z.string().optional(),
      bonus: z.number().optional(),
      notes: z.string().optional(),
    })
    .nullable(),
  notes: z.string().nullable(),
  receipt: submissionReceiptSchema.nullable(),
  events: z.array(applicationEventItemSchema),
  updatedAt: z.string(),
});

export const createApplicationPayloadSchema = z.object({
  jobId: z.string().min(1),
  language: z.enum(["en", "ar"]).default("en"),
});

export const approveApplicationPayloadSchema = z.object({
  applicationId: z.string().min(1),
});

export const submitApplicationPayloadSchema = z.object({
  applicationId: z.string().min(1),
  hasConfirmationSignal: z.boolean(),
  confirmationCode: z.string().optional(),
  confirmationText: z.string().optional(),
  submittedUrl: z.string().optional(),
  uncertaintyReason: z.string().optional(),
});

export const transitionApplicationPayloadSchema = z.object({
  applicationId: z.string().min(1),
  targetUiStatus: applicationUiStatusSchema,
  reason: z.string().min(1),
  interviewScheduledAt: z.string().optional(),
  offerDetails: z
    .object({
      baseSalary: z.number().optional(),
      currency: z.string().optional(),
      equity: z.string().optional(),
      bonus: z.number().optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

export const todayDashboardResponseSchema = z.object({
  metrics: z.object({
    suitableJobsCount: z.number(),
    applicationsReadyForApprovalCount: z.number(),
    claimsNeedingVerificationCount: z.number(),
    uncertainSubmissionsCount: z.number(),
    upcomingInterviewsCount: z.number(),
    followUpRemindersCount: z.number(),
  }),
  recommendedJobs: z.array(jobWithFitSchema),
  applicationsNeedingAction: z.array(applicationItemSchema),
  pendingClaims: z.array(careerClaimItemSchema),
  recentActivity: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      description: z.string(),
      createdAt: z.string(),
    }),
  ),
});

export const careerWorkspaceResponseSchema = z.object({
  profile: z.object({
    id: z.string(),
    userId: z.string(),
    headline: z.string(),
    summary: z.string(),
    location: z.string(),
    yearsOfExperience: z.number(),
    completenessScore: z.number(),
  }),
  claims: z.array(careerClaimItemSchema),
  evidence: z.array(careerEvidenceItemSchema),
  revisions: z.array(careerRevisionItemSchema),
  preferences: careerPreferencesSchema,
  reusableAnswers: z.array(reusableAnswerItemSchema),
});

export const evaluateFieldPolicyPayloadSchema = z.object({
  fields: z.array(
    z.object({
      key: z.string().min(1),
      label: z.string().optional(),
      name: z.string().optional(),
      type: z.string().optional(),
      category: z.string().optional(),
      contextQuestion: z.string().optional(),
      proposedAnswer: z.string().optional(),
    }),
  ),
});

export const atsProviderSchema = z.enum(["greenhouse", "lever"]);

export const atsWebhookPayloadSchema = z.object({
  action: z.string().optional(),
  event: z.string().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  triggeredAt: z.union([z.number(), z.string()]).optional(),
  signature: z.string().optional(),
});
