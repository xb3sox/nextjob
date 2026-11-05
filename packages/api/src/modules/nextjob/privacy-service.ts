import { eq } from "@workspace/db";
import {
  approvalCheckpoint,
  auditEvent,
  careerClaim,
  careerEvidence,
  careerPreference,
  careerProfile,
  careerRevision,
  jobApplication,
  reusableAnswer,
} from "@workspace/db/schema";

import {
  computeSha256,
  createId,
  deleteUserStore,
  getUserStore,
} from "./store";

import type { UserCareerStore } from "./store";

export interface GdprExportBundle {
  exportMetadata: {
    formatVersion: string;
    subjectId: string;
    exportedAt: string;
    exportId: string;
    recordsCount: number;
    sha256Checksum: string;
  };
  profile: UserCareerStore["profile"];
  claims: UserCareerStore["claims"];
  evidence: UserCareerStore["evidence"];
  revisions: UserCareerStore["revisions"];
  preferences: UserCareerStore["preferences"];
  reusableAnswers: UserCareerStore["reusableAnswers"];
  tailoredDocuments: UserCareerStore["tailoredDocuments"];
  applications: UserCareerStore["applications"];
  receipts: UserCareerStore["receipts"];
}

export interface ErasureResult {
  erased: boolean;
  subjectId: string;
  erasedAt: string;
  clearedCollections: string[];
  dbRecordsRemoved?: boolean;
}

export interface ConsentRecord {
  userId: string;
  dataProcessingConsent: boolean;
  aiAnalysisConsent: boolean;
  autoApplyConsent: boolean;
  updatedAt: string;
}

const userConsents = new Map<string, ConsentRecord>();

/**
 * GDPR Article 20 - Right to Data Portability
 * Exports all candidate career facts, verified claims, tailored documents,
 * and immutable submission receipts in structured, machine-readable JSON format.
 */
export const exportCandidateData = (userId: string): GdprExportBundle => {
  const store = getUserStore(userId);
  const exportedAt = new Date().toISOString();
  const exportId = createId("dsr-exp");

  const recordsCount =
    store.claims.length +
    store.evidence.length +
    store.revisions.length +
    store.reusableAnswers.length +
    store.tailoredDocuments.length +
    store.applications.length +
    store.receipts.length;

  const rawPayload = JSON.stringify({
    profile: store.profile,
    claims: store.claims,
    evidence: store.evidence,
    revisions: store.revisions,
    preferences: store.preferences,
    reusableAnswers: store.reusableAnswers,
    tailoredDocuments: store.tailoredDocuments,
    applications: store.applications,
    receipts: store.receipts,
  });

  const sha256Checksum = computeSha256(rawPayload);

  return {
    exportMetadata: {
      formatVersion: "1.0.0",
      subjectId: userId,
      exportedAt,
      exportId,
      recordsCount,
      sha256Checksum,
    },
    profile: store.profile,
    claims: store.claims,
    evidence: store.evidence,
    revisions: store.revisions,
    preferences: store.preferences,
    reusableAnswers: store.reusableAnswers,
    tailoredDocuments: store.tailoredDocuments,
    applications: store.applications,
    receipts: store.receipts,
  };
};

/**
 * GDPR Article 17 - Right to Erasure ("Right to be Forgotten")
 * Irrevocably removes candidate career graphs, tailoring artifacts,
 * applications, and audit records from in-memory stores and PostgreSQL.
 */
export const eraseCandidateData = async (
  userId: string,
): Promise<ErasureResult> => {
  const erasedAt = new Date().toISOString();
  let dbRecordsRemoved = false;

  // 1. Clear in-memory state
  deleteUserStore(userId);
  userConsents.delete(userId);

  // 2. Cascade delete from PostgreSQL if connected
  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("@workspace/db/server");
      await db.delete(careerProfile).where(eq(careerProfile.userId, userId));
      await db.delete(careerClaim).where(eq(careerClaim.userId, userId));
      await db.delete(careerEvidence).where(eq(careerEvidence.userId, userId));
      await db.delete(careerRevision).where(eq(careerRevision.userId, userId));
      await db
        .delete(careerPreference)
        .where(eq(careerPreference.userId, userId));
      await db.delete(reusableAnswer).where(eq(reusableAnswer.userId, userId));
      await db.delete(jobApplication).where(eq(jobApplication.userId, userId));
      await db
        .delete(approvalCheckpoint)
        .where(eq(approvalCheckpoint.userId, userId));
      await db.delete(auditEvent).where(eq(auditEvent.userId, userId));
      dbRecordsRemoved = true;
    } catch {
      dbRecordsRemoved = false;
    }
  }

  return {
    erased: true,
    subjectId: userId,
    erasedAt,
    clearedCollections: [
      "profile",
      "careerClaims",
      "careerEvidence",
      "careerRevisions",
      "careerPreferences",
      "reusableAnswers",
      "tailoredDocuments",
      "jobApplications",
      "submissionReceipts",
      "approvalCheckpoints",
    ],
    dbRecordsRemoved,
  };
};

/**
 * Updates or queries candidate consent preferences for processing,
 * AI tailoring, and automated submissions.
 */
export const updateCandidateConsent = (
  userId: string,
  consents: {
    dataProcessingConsent?: boolean;
    aiAnalysisConsent?: boolean;
    autoApplyConsent?: boolean;
  },
): ConsentRecord => {
  const existing = userConsents.get(userId) ?? {
    userId,
    dataProcessingConsent: true,
    aiAnalysisConsent: true,
    autoApplyConsent: false,
    updatedAt: new Date().toISOString(),
  };

  const updated: ConsentRecord = {
    userId,
    dataProcessingConsent:
      consents.dataProcessingConsent ?? existing.dataProcessingConsent,
    aiAnalysisConsent: consents.aiAnalysisConsent ?? existing.aiAnalysisConsent,
    autoApplyConsent: consents.autoApplyConsent ?? existing.autoApplyConsent,
    updatedAt: new Date().toISOString(),
  };

  userConsents.set(userId, updated);
  return updated;
};

export const getCandidateConsent = (userId: string): ConsentRecord => {
  const existing = userConsents.get(userId);
  if (!existing) {
    return {
      userId,
      dataProcessingConsent: true,
      aiAnalysisConsent: true,
      autoApplyConsent: false,
      updatedAt: new Date().toISOString(),
    };
  }
  return existing;
};
