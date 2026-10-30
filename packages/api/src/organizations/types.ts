/**
 * Organization, Cohort, and Aggregate Reporting types (T-30, FR-09, G-10).
 */

export const MINIMUM_COHORT_SIZE_FOR_REPORTING = 5; // G-10 threshold

export interface Organization {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  licenseCount: number;
  usedLicenses: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cohort {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
}

export type ParticipantStatus = 'invited' | 'active' | 'graduated' | 'removed';

export interface CohortParticipant {
  id: string;
  tenantId: string;
  organizationId: string;
  cohortId: string;
  userId?: string;
  email: string;
  status: ParticipantStatus;
  inviteToken?: string;
  inviteExpiresAt?: Date;
  joinedAt?: Date | null;
  createdAt: Date;
}

export interface AggregateCohortMetrics {
  cohortId: string;
  cohortName: string;
  participantCount: number;
  activeSeekersCount: number;
  totalApplicationsSubmitted: number;
  interviewRatePercentage: number;
  offerRatePercentage: number;
  averageApplicationsPerSeeker: number;
  generatedAt: Date;
}

export class CohortTooSmallError extends Error {
  public readonly code = 'COHORT_TOO_SMALL';
  constructor(public readonly actualCount: number) {
    super(
      `Privacy protection threshold violated: cohort has ${actualCount} participants, but aggregate reporting requires at least ${MINIMUM_COHORT_SIZE_FOR_REPORTING} participants (G-10).`
    );
    this.name = 'CohortTooSmallError';
  }
}

export class LicenseQuotaExceededError extends Error {
  public readonly code = 'LICENSE_QUOTA_EXCEEDED';
  constructor(public readonly limit: number) {
    super(
      `Organization license limit reached (${limit} seats allocated). Upgrade plan to invite more participants.`
    );
    this.name = 'LicenseQuotaExceededError';
  }
}
