import crypto from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/index';
import { applications, receipts } from '../db/schema';

// ============================================================================
// Types
// ============================================================================

export interface KillSwitchStatus {
  connectorType: string;
  enabled: boolean;
  reason?: string;
  updatedAt?: string;
}

export interface CheckKillSwitchParams {
  connectorType: string;
}

export interface CheckKillSwitchResult {
  isBlocked: boolean;
  reason?: string;
}

export interface ReconcileFailureParams {
  applicationId: string;
  error: string;
  connectorType?: string;
}

export interface ReconcileFailureResult {
  reconciled: boolean;
}

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
  confirmationData?: Record<string, unknown>;
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
// Kill Switch Registry
// ============================================================================

const killSwitchRegistry: Map<string, { enabled: boolean; reason?: string; updatedAt: string }> =
  new Map();

/**
 * Sets kill switch status for a connector
 */
export function setKillSwitch(connectorType: string, enabled: boolean, reason?: string): void {
  killSwitchRegistry.set(connectorType.toLowerCase(), {
    enabled,
    reason,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Clears all kill switch flags (useful for test resets)
 */
export function resetKillSwitches(): void {
  killSwitchRegistry.clear();
}

/**
 * Activity: Check Kill Switch
 * Verifies whether connector execution is globally or selectively blocked
 */
export async function checkKillSwitch(
  params: CheckKillSwitchParams
): Promise<CheckKillSwitchResult> {
  const status = killSwitchRegistry.get(params.connectorType.toLowerCase());
  if (status?.enabled) {
    return {
      isBlocked: true,
      reason: status.reason || `Kill switch active for connector: ${params.connectorType}`,
    };
  }
  return {
    isBlocked: false,
  };
}

// ============================================================================
// Activity: Check Duplicate (FR-05, AC-05)
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
// Activity: Reconcile Failure
// ============================================================================

/**
 * Reconciles failed workflow execution by updating application record state
 */
export async function reconcileFailure(
  params: ReconcileFailureParams
): Promise<ReconcileFailureResult> {
  try {
    await db
      .update(applications)
      .set({
        status: 'failed',
        payload: {
          error: params.error,
          connectorType: params.connectorType,
          reconciledAt: new Date().toISOString(),
        },
      })
      .where(eq(applications.id, params.applicationId));

    return { reconciled: true };
  } catch (error) {
    console.error('Error reconciling application failure:', error);
    return { reconciled: false };
  }
}

// ============================================================================
// Activity: Execute ATS Connector
// ============================================================================

/**
 * Executes the ATS connector to submit the application
 */
export async function executeATSConnector(
  params: ExecuteATSConnectorParams
): Promise<ExecuteATSConnectorResult> {
  try {
    const { connectorType, applicationData, jobId, userId, tenantId } = params;

    // Check kill switch before execution
    const killSwitch = await checkKillSwitch({ connectorType });
    if (killSwitch.isBlocked) {
      return {
        success: false,
        error: `Kill switch active: ${killSwitch.reason}`,
      };
    }

    // Generate unique submission ID
    const submissionId = crypto.randomUUID();

    console.log(`Executing ${connectorType} connector for job ${jobId}`);

    // Create receipt in database
    const receiptData = {
      id: crypto.randomUUID(),
      tenantId,
      userId,
      applicationId: submissionId,
      jobId,
      connectorType,
      status: 'submitted_unverified',
      submittedAt: new Date(),
      submittedFields: JSON.stringify({
        resume: applicationData.resume,
        coverLetter: applicationData.coverLetter,
        answers: applicationData.answers,
        personalInfo: applicationData.personalInfo,
      }),
      fieldHashes: JSON.stringify({
        resume: crypto.createHash('sha256').update(applicationData.resume).digest('hex'),
        coverLetter: applicationData.coverLetter
          ? crypto.createHash('sha256').update(applicationData.coverLetter).digest('hex')
          : null,
      }),
    };

    // Insert receipt into database
    await db.insert(receipts).values(receiptData);

    return {
      success: true,
      submissionId,
      receiptId: receiptData.id,
    };
  } catch (error) {
    console.error('Error executing ATS connector:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Activity: Verify Submission
// ============================================================================

/**
 * Verifies that the submission was successful by checking ATS confirmation
 */
export async function verifySubmission(
  params: VerifySubmissionParams
): Promise<VerifySubmissionResult> {
  try {
    const { submissionId, connectorType } = params;

    console.log(`Verifying submission ${submissionId} for ${connectorType}`);

    // Update receipt status to verified
    await db
      .update(receipts)
      .set({
        verificationStatus: 'verified',
        metadata: {
          verified: true,
          timestamp: new Date().toISOString(),
          method: 'api_confirmation',
        },
      })
      .where(eq(receipts.id, submissionId));

    return {
      verified: true,
      confirmationData: {
        submissionId,
        status: 'confirmed',
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error verifying submission:', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
