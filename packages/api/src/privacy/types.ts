/**
 * Privacy Controls Types & Definitions (FR-10, PRD §Privacy Requirements)
 *
 * Supports user rights:
 * - View data
 * - Correct data
 * - Export data (structured JSON with sha256 checksum)
 * - Delete data (hard cascading deletion)
 * - Revoke consent & purpose limitation
 * - Disconnect integrations
 * - Disable AI model learning opt-out
 * - Consent versioning & retention schedules
 */

export type PrivacyPurpose =
  | 'job_discovery'
  | 'eligibility_evaluation'
  | 'tailoring'
  | 'application_submission'
  | 'model_training'
  | 'marketing'
  | 'recruiter_contact';

export type ConsentStatus = 'granted' | 'revoked' | 'expired';

export interface ConsentRecord {
  id: string;
  tenantId: string;
  userId: string;
  purpose: PrivacyPurpose;
  status: ConsentStatus;
  policyVersion: string;
  grantedAt: Date;
  revokedAt?: Date;
  retentionDays: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConnectedAccount {
  id: string;
  provider: string;
  accountId: string;
  connectedAt: Date;
  scopes: string[];
}

export interface PrivacyPreferences {
  userId: string;
  tenantId: string;
  disableModelLearning: boolean;
  allowRecruiterContact: boolean;
  allowAggregatedAnalytics: boolean;
  retentionDays: number;
  updatedAt: Date;
}

export interface CandidateDataView {
  userId: string;
  tenantId: string;
  profile: Record<string, unknown>;
  claims: Array<Record<string, unknown>>;
  evidence: Array<Record<string, unknown>>;
  applications: Array<Record<string, unknown>>;
  receipts: Array<Record<string, unknown>>;
  consents: ConsentRecord[];
  preferences: PrivacyPreferences;
  connectedAccounts: ConnectedAccount[];
}

export interface DataCorrectionRequest {
  id: string;
  userId: string;
  tenantId: string;
  field: string;
  previousValue: unknown;
  newValue: unknown;
  reason?: string;
  timestamp: Date;
}

export interface DataExport {
  formatVersion: '1.0.0';
  exportedAt: string;
  tenantId: string;
  userId: string;
  candidateData: CandidateDataView;
  sha256Checksum: string;
}

export interface DataDeletionReceipt {
  deletionId: string;
  userId: string;
  tenantId: string;
  requestedAt: string;
  completedAt: string;
  recordsDeleted: {
    profile: number;
    claims: number;
    evidence: number;
    applications: number;
    receipts: number;
    tokens: number;
    consents: number;
  };
  verificationHash: string;
  status: 'completed';
}
