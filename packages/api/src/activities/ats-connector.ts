import { and, eq } from 'drizzle-orm';
import { db } from '../db/index';
import { applications } from '../db/schema';

// ============================================================================
// Types
// ============================================================================

export interface ExecuteATSConnectorParams {
  connectorType: string;
  applicationData: {
    resume: string;
    coverLetter?: string;
    answers: Record<string, string>;
    personalInfo: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  jobId: string;
  userId: string;
  tenantId: string;
}

export interface ExecuteATSConnectorResult {
  success: boolean;
  submissionId?: string;
  receiptId?: string;
  error?: string;
}

export interface VerifySubmissionParams {
  submissionId: string;
  connectorType: string;
}

export interface VerifySubmissionResult {
  verified: boolean;
  confirmationData?: any;
  error?: string;
}

export interface CheckDuplicateParams {
  applicationId: string;
  idempotencyKey: string;
}

export interface CheckDuplicateResult {
  isDuplicate: boolean;
  existingSubmissionId?: string;
}

// ============================================================================
// Activity: Check Duplicate
// ============================================================================

/**
 * Checks if an application has already been submitted (idempotency check)
 */
export async function checkDuplicate(params: CheckDuplicateParams): Promise<CheckDuplicateResult> {
  try {
    // Check if application already has a verified receipt
    const existingApplication = await db.query.applications.findFirst({
      where: and(eq(applications.id, params.applicationId), eq(applications.status, 'submitted')),
    });

    if (existingApplication) {
      return {
        isDuplicate: true,
        existingSubmissionId: existingApplication.id,
      };
    }

    return {
      isDuplicate: false,
    };
  } catch (error) {
    console.error('Error checking duplicate:', error);
    throw error;
  }
}

// ============================================================================
// Activity: Execute ATS Connector
// ============================================================================

/** Fail closed until a real connector is implemented. */
export async function executeATSConnector(
  _params: ExecuteATSConnectorParams
): Promise<ExecuteATSConnectorResult> {
  return { success: false, error: 'ATS connector is not implemented' };
}

/** Fail closed until confirmation can be obtained from the ATS. */
export async function verifySubmission(
  _params: VerifySubmissionParams
): Promise<VerifySubmissionResult> {
  return { verified: false, error: 'ATS submission verification is not implemented' };
}
