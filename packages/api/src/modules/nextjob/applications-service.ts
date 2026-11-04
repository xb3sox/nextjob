import { HttpStatusCode } from "@workspace/shared/constants";
import { HttpException } from "@workspace/shared/utils";

import { listJobsWithFitForUser } from "./jobs-service";
import {
  assertResourceOwnership,
  computeSha256,
  createId,
  getGlobalJobCatalog,
  getUserStore,
} from "./store";
import { generateTailoredDocumentForJob } from "./tailoring-service";

import type { ApplicationItem, SubmissionReceiptItem } from "./store";
import type {
  applicationInternalStateSchema,
  applicationUiStatusSchema,
  approveApplicationPayloadSchema,
  createApplicationPayloadSchema,
  submitApplicationPayloadSchema,
  transitionApplicationPayloadSchema,
} from "../../schema/nextjob";
import type * as z from "zod";

type ApplicationUiStatus = z.infer<typeof applicationUiStatusSchema>;
type ApplicationInternalState = z.infer<typeof applicationInternalStateSchema>;

const UI_STATUS_TO_INTERNAL: Record<ApplicationUiStatus, ApplicationInternalState> = {
  Saved: "SAVED",
  Preparing: "TAILORING",
  "Needs Approval": "READY_FOR_REVIEW",
  Ready: "APPROVED_TO_SUBMIT",
  Submitting: "SUBMITTING",
  "Submission Uncertain": "SUBMITTED_UNVERIFIED",
  Confirmed: "SUBMITTED_VERIFIED",
  Interview: "INTERVIEW",
  Offer: "OFFER",
  Rejected: "REJECTED",
  Withdrawn: "WITHDRAWN",
  Failed: "FAILED",
};

const computeReceiptHash = (params: {
  applicationId: string;
  userId: string;
  jobId: string;
  tailoredDocumentId: string | null;
  verificationStatus: "SUBMITTED_VERIFIED" | "SUBMITTED_UNVERIFIED";
  confirmationCode: string | null;
  payloadHash: string;
  submittedAt: string;
}): string => {
  return computeSha256(
    `${params.applicationId}|${params.userId}|${params.jobId}|${params.tailoredDocumentId ?? ""}|${params.verificationStatus}|${params.confirmationCode ?? ""}|${params.payloadHash}|${params.submittedAt}`,
  );
};

export const verifySubmissionReceiptIntegrity = (
  receipt: SubmissionReceiptItem,
): boolean => {
  const expected = computeReceiptHash({
    applicationId: receipt.applicationId,
    userId: receipt.userId,
    jobId: receipt.jobId,
    tailoredDocumentId: receipt.tailoredDocumentId,
    verificationStatus: receipt.verificationStatus,
    confirmationCode: receipt.confirmationCode,
    payloadHash: receipt.payloadHash,
    submittedAt: receipt.submittedAt,
  });
  return expected === receipt.receiptHash;
};

export const listApplicationsForUser = (userId: string): ApplicationItem[] => {
  const store = getUserStore(userId);
  return store.applications;
};

/**
 * Section 9 P0-08 & Section 10 Acceptance Scenario #5:
 * Preparing an application creates or updates a tracked application record with job snapshot,
 * tailored document, and initial 'Needs Approval' (`READY_FOR_REVIEW`) state.
 * Prevents duplicate applications for the same user + job.
 */
export const createOrPrepareApplication = (
  userId: string,
  payload: z.infer<typeof createApplicationPayloadSchema>,
): {
  application: ApplicationItem;
  isDuplicate: boolean;
} => {
  const store = getUserStore(userId);
  const job = getGlobalJobCatalog().find((j) => j.id === payload.jobId);

  if (!job) {
    throw new HttpException(HttpStatusCode.NOT_FOUND, {
      code: "error.notFound",
      message: "Job listing not found.",
    });
  }

  const existing = store.applications.find((app) => app.jobId === payload.jobId);
  if (existing) {
    assertResourceOwnership(userId, existing.userId, "application");
    return {
      application: existing,
      isDuplicate: true,
    };
  }

  const tailoredDoc = generateTailoredDocumentForJob(userId, {
    jobId: payload.jobId,
    language: payload.language,
    includeCoverLetter: true,
  });

  const now = new Date().toISOString();
  const appId = createId("app");

  const application: ApplicationItem = {
    id: appId,
    userId,
    jobId: job.id,
    tailoredDocumentId: tailoredDoc.id,
    company: job.company,
    roleTitle: job.title,
    sourceUrl: job.sourceUrl,
    uiStatus: "Needs Approval",
    internalState: "READY_FOR_REVIEW",
    approvedPayloadHash: null,
    approvedAt: null,
    approvedByUserId: null,
    submittedAt: null,
    uncertaintyReason: null,
    followUpDueAt: null,
    interviewScheduledAt: null,
    offerDetails: null,
    notes: `Prepared evidence-constrained tailored resume (${tailoredDoc.language.toUpperCase()}) from ${tailoredDoc.sourceClaimIds.length} verified claims.`,
    receipt: null,
    events: [
      {
        id: createId("evt"),
        applicationId: appId,
        fromState: "SAVED",
        toState: "READY_FOR_REVIEW",
        actor: userId,
        reason: `Application prepared with tailored document ${tailoredDoc.id} (payload SHA-256: ${tailoredDoc.payloadHash.slice(0, 12)}).`,
        createdAt: now,
      },
    ],
    updatedAt: now,
  };

  store.applications.unshift(application);
  store.savedJobIds.add(job.id);

  return {
    application,
    isDuplicate: false,
  };
};

/**
 * Explicit Human Approval Gate (Section 15 & Section 16):
 * Binds user approval to the exact SHA-256 payloadHash of the tailored document.
 * Transitions application from `Needs Approval` (`READY_FOR_REVIEW`) to `Ready` (`APPROVED_TO_SUBMIT`).
 */
export const approveApplicationForSubmission = (
  userId: string,
  payload: z.infer<typeof approveApplicationPayloadSchema>,
): ApplicationItem => {
  const store = getUserStore(userId);
  const app = store.applications.find((a) => a.id === payload.applicationId);

  if (!app) {
    throw new HttpException(HttpStatusCode.NOT_FOUND, {
      code: "error.notFound",
      message: "Application not found.",
    });
  }

  assertResourceOwnership(userId, app.userId, "application");

  const doc = store.tailoredDocuments.find(
    (d) => d.id === app.tailoredDocumentId,
  );
  if (!doc) {
    throw new HttpException(HttpStatusCode.UNPROCESSABLE_ENTITY, {
      code: "error.invalid",
      message: "Cannot approve application without a tailored document.",
    });
  }

  const now = new Date().toISOString();
  doc.status = "approved";
  doc.approvedAt = now;

  const previousState = app.internalState;
  app.uiStatus = "Ready";
  app.internalState = "APPROVED_TO_SUBMIT";
  app.approvedPayloadHash = doc.payloadHash;
  app.approvedAt = now;
  app.approvedByUserId = userId;
  app.updatedAt = now;

  app.events.unshift({
    id: createId("evt"),
    applicationId: app.id,
    fromState: previousState,
    toState: "APPROVED_TO_SUBMIT",
    actor: userId,
    reason: `User explicitly approved application payload hash ${doc.payloadHash.slice(0, 16)}.`,
    createdAt: now,
  });

  return app;
};

/**
 * Section 10 Acceptance Scenario #6 (Submission Uncertainty) & Section 16 (No Unconfirmed Submission Claim):
 * - Requires prior explicit user approval bound to the current tailored document payload hash.
 * - Blocks automatic retry if the application is already in `Submission Uncertain` (`SUBMITTED_UNVERIFIED`) or `Confirmed` (`SUBMITTED_VERIFIED`).
 * - When `hasConfirmationSignal` is false, records `Submission Uncertain` (`SUBMITTED_UNVERIFIED`) and never marks it as Confirmed.
 * - When `hasConfirmationSignal` is true, records `Confirmed` (`SUBMITTED_VERIFIED`) and issues a cryptographic SHA-256 `SubmissionReceipt`.
 */
export const recordApplicationSubmission = (
  userId: string,
  payload: z.infer<typeof submitApplicationPayloadSchema>,
): ApplicationItem => {
  const store = getUserStore(userId);
  const app = store.applications.find((a) => a.id === payload.applicationId);

  if (!app) {
    throw new HttpException(HttpStatusCode.NOT_FOUND, {
      code: "error.notFound",
      message: "Application not found.",
    });
  }

  assertResourceOwnership(userId, app.userId, "application");

  // Guard: Never automatically retry an uncertain or already confirmed submission
  if (
    app.internalState === "SUBMITTED_UNVERIFIED" ||
    app.uiStatus === "Submission Uncertain"
  ) {
    throw new HttpException(HttpStatusCode.CONFLICT, {
      code: "error.invalid",
      message:
        "Submission is in 'Submission Uncertain' state. Automatic retry is blocked to prevent duplicate applications; manual verification is required.",
    });
  }

  if (
    app.internalState === "SUBMITTED_VERIFIED" ||
    app.uiStatus === "Confirmed"
  ) {
    throw new HttpException(HttpStatusCode.CONFLICT, {
      code: "error.invalid",
      message: "Application has already been confirmed as submitted.",
    });
  }

  const doc = store.tailoredDocuments.find(
    (d) => d.id === app.tailoredDocumentId,
  );
  const currentPayloadHash = doc?.payloadHash ?? app.approvedPayloadHash;

  // Guard: Must be explicitly approved for the exact current payload hash
  if (
    app.internalState !== "APPROVED_TO_SUBMIT" ||
    !app.approvedPayloadHash ||
    app.approvedPayloadHash !== currentPayloadHash
  ) {
    throw new HttpException(HttpStatusCode.FORBIDDEN, {
      code: "error.forbidden",
      message:
        "Explicit user approval for the current document payload hash is required before submission.",
    });
  }

  const now = new Date().toISOString();
  const followUpDate = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();
  const previousState = app.internalState;

  const hasValidConfirmation = Boolean(
    payload.hasConfirmationSignal &&
      ((payload.confirmationCode && payload.confirmationCode.trim().length > 0) ||
        (payload.confirmationText && payload.confirmationText.trim().length > 0)),
  );

  const verificationStatus = hasValidConfirmation
    ? "SUBMITTED_VERIFIED"
    : "SUBMITTED_UNVERIFIED";

  const receiptHash = computeReceiptHash({
    applicationId: app.id,
    userId,
    jobId: app.jobId,
    tailoredDocumentId: app.tailoredDocumentId,
    verificationStatus,
    confirmationCode: payload.confirmationCode ?? null,
    payloadHash: app.approvedPayloadHash,
    submittedAt: now,
  });

  const receipt: SubmissionReceiptItem = Object.freeze({
    id: createId("rcpt"),
    applicationId: app.id,
    userId,
    jobId: app.jobId,
    tailoredDocumentId: app.tailoredDocumentId,
    verificationStatus,
    confirmationCode: payload.confirmationCode ?? null,
    confirmationText: payload.confirmationText ?? null,
    submittedUrl: payload.submittedUrl ?? app.sourceUrl,
    payloadHash: app.approvedPayloadHash,
    receiptHash,
    submittedAt: now,
  });

  store.receipts.unshift(receipt);
  app.receipt = receipt;
  app.submittedAt = now;
  app.followUpDueAt = followUpDate;
  app.updatedAt = now;

  if (hasValidConfirmation) {
    app.uiStatus = "Confirmed";
    app.internalState = "SUBMITTED_VERIFIED";
    app.uncertaintyReason = null;
    app.events.unshift({
      id: createId("evt"),
      applicationId: app.id,
      fromState: previousState,
      toState: "SUBMITTED_VERIFIED",
      actor: userId,
      reason: `Confirmed submission with cryptographic receipt ${receipt.id} (SHA-256: ${receipt.receiptHash.slice(0, 16)}).`,
      createdAt: now,
    });
  } else {
    app.uiStatus = "Submission Uncertain";
    app.internalState = "SUBMITTED_UNVERIFIED";
    app.uncertaintyReason =
      payload.uncertaintyReason ??
      "No confirmation banner, reference code, or receipt signal was returned by the employer portal. Automatic retry is blocked.";
    app.events.unshift({
      id: createId("evt"),
      applicationId: app.id,
      fromState: previousState,
      toState: "SUBMITTED_UNVERIFIED",
      actor: userId,
      reason: `Submission attempt lacked confirmation evidence: ${app.uncertaintyReason}`,
      createdAt: now,
    });
  }

  return app;
};

export const transitionApplicationStatus = (
  userId: string,
  payload: z.infer<typeof transitionApplicationPayloadSchema>,
): ApplicationItem => {
  const store = getUserStore(userId);
  const app = store.applications.find((a) => a.id === payload.applicationId);

  if (!app) {
    throw new HttpException(HttpStatusCode.NOT_FOUND, {
      code: "error.notFound",
      message: "Application not found.",
    });
  }

  assertResourceOwnership(userId, app.userId, "application");

  const previousState = app.internalState;
  const targetInternal = UI_STATUS_TO_INTERNAL[payload.targetUiStatus];
  const now = new Date().toISOString();

  app.uiStatus = payload.targetUiStatus;
  app.internalState = targetInternal;
  if (payload.interviewScheduledAt) {
    app.interviewScheduledAt = payload.interviewScheduledAt;
  }
  if (payload.offerDetails) {
    app.offerDetails = payload.offerDetails;
  }
  if (payload.targetUiStatus === "Confirmed") {
    app.uncertaintyReason = null;
  }
  app.updatedAt = now;

  app.events.unshift({
    id: createId("evt"),
    applicationId: app.id,
    fromState: previousState,
    toState: targetInternal,
    actor: userId,
    reason: payload.reason,
    createdAt: now,
  });

  return app;
};

/**
 * Builds the Today daily action dashboard (Section 5.1):
 * Prioritizes actions over analytics:
 * - "X suitable jobs found."
 * - "Y applications ready for approval."
 * - "Z claims need your verification."
 */
export const getTodayDashboardForUser = (userId: string) => {
  const store = getUserStore(userId);
  const allJobs = listJobsWithFitForUser(userId);
  const suitableJobs = allJobs.filter(
    (j) =>
      j.eligibilityStatus === "eligible" &&
      (j.recommendation === "strong_match" || j.recommendation === "good_match"),
  );

  const applicationsNeedingApproval = store.applications.filter(
    (a) => a.uiStatus === "Needs Approval" || a.uiStatus === "Preparing",
  );
  const uncertainSubmissions = store.applications.filter(
    (a) => a.uiStatus === "Submission Uncertain",
  );
  const upcomingInterviews = store.applications.filter(
    (a) => a.uiStatus === "Interview",
  );
  const followUpReminders = store.applications.filter(
    (a) => Boolean(a.followUpDueAt) && (a.uiStatus === "Confirmed" || a.uiStatus === "Submission Uncertain"),
  );
  const pendingClaims = store.claims.filter(
    (c) =>
      c.verificationStatus === "pending_review" ||
      c.verificationStatus === "disputed" ||
      c.verificationStatus === "unverified",
  );

  const recentActivity = [
    ...store.applications.flatMap((a) =>
      a.events.slice(0, 2).map((e) => ({
        id: e.id,
        action: `${a.company} (${a.uiStatus})`,
        description: e.reason,
        createdAt: e.createdAt,
      })),
    ),
    ...store.revisions.slice(0, 4).map((r) => ({
      id: r.id,
      action: `Career Profile (${r.action})`,
      description: r.reason ?? "Updated career record.",
      createdAt: r.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return {
    metrics: {
      suitableJobsCount: suitableJobs.length,
      applicationsReadyForApprovalCount: applicationsNeedingApproval.length,
      claimsNeedingVerificationCount: pendingClaims.length,
      uncertainSubmissionsCount: uncertainSubmissions.length,
      upcomingInterviewsCount: upcomingInterviews.length,
      followUpRemindersCount: followUpReminders.length,
    },
    recommendedJobs: suitableJobs.slice(0, 4),
    applicationsNeedingAction: [
      ...uncertainSubmissions,
      ...applicationsNeedingApproval,
      ...upcomingInterviews,
    ].slice(0, 5),
    pendingClaims: pendingClaims.slice(0, 5),
    recentActivity,
  };
};
