import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/ats-connector.js';

// Import activities with durable retry policy
const { checkKillSwitch, checkDuplicate, executeATSConnector, verifySubmission, reconcileFailure } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: '5 minutes',
    retry: {
      maximumAttempts: 3,
      initialInterval: '1s',
      backoffCoefficient: 2,
      nonRetryableErrorTypes: ['KillSwitchError', 'DuplicateApplicationError'],
    },
  });

// ============================================================================
// Types
// ============================================================================

export interface ConnectorExecutionParams {
  applicationId: string;
  userId: string;
  tenantId: string;
  jobId: string;
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
  idempotencyKey: string;
}

export interface ConnectorExecutionResult {
  success: boolean;
  submissionId?: string;
  receiptId?: string;
  status: 'SUBMITTED' | 'FAILED' | 'DUPLICATE' | 'KILL_SWITCH_BLOCKED';
  error?: string;
  verified: boolean;
  timestamp: string;
}

// ============================================================================
// Connector Execution Workflow (T-24, FR-05)
// ============================================================================

/**
 * Main Temporal workflow for orchestrating ATS connector execution.
 * Handles kill switch verification, idempotency duplicate prevention,
 * durable activity retries, receipt verification, and failure reconciliation.
 */
export async function connectorExecutionWorkflow(
  params: ConnectorExecutionParams
): Promise<ConnectorExecutionResult> {
  const timestamp = new Date().toISOString();

  try {
    // Step 1: Kill switch check (immediate circuit breaker)
    const killSwitch = await checkKillSwitch({
      connectorType: params.connectorType,
    });

    if (killSwitch.isBlocked) {
      await reconcileFailure({
        applicationId: params.applicationId,
        error: killSwitch.reason || 'Kill switch is active',
        connectorType: params.connectorType,
      });

      return {
        success: false,
        status: 'KILL_SWITCH_BLOCKED',
        error: killSwitch.reason || `Connector ${params.connectorType} is disabled by kill switch`,
        verified: false,
        timestamp,
      };
    }

    // Step 2: Check for duplicates (idempotency - FR-05, AC-05)
    const duplicateCheck = await checkDuplicate({
      applicationId: params.applicationId,
      idempotencyKey: params.idempotencyKey,
    });

    if (duplicateCheck.isDuplicate) {
      return {
        success: false,
        status: 'DUPLICATE',
        error: 'Application already submitted for this job',
        verified: true,
        submissionId: duplicateCheck.existingSubmissionId,
        timestamp,
      };
    }

    // Step 3: Execute the ATS connector (durable with retries)
    const executionResult = await executeATSConnector({
      connectorType: params.connectorType,
      applicationData: params.applicationData,
      jobId: params.jobId,
      userId: params.userId,
      tenantId: params.tenantId,
    });

    if (!executionResult.success) {
      await reconcileFailure({
        applicationId: params.applicationId,
        error: executionResult.error || 'ATS connector execution failed',
        connectorType: params.connectorType,
      });

      return {
        success: false,
        status: 'FAILED',
        error: executionResult.error,
        verified: false,
        timestamp,
      };
    }

    // Step 4: Verify the submission
    const verificationResult = await verifySubmission({
      submissionId: executionResult.submissionId ?? '',
      connectorType: params.connectorType,
    });

    return {
      success: true,
      submissionId: executionResult.submissionId,
      receiptId: executionResult.receiptId,
      status: 'SUBMITTED',
      verified: verificationResult.verified,
      timestamp,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown workflow execution error';
    console.error('Connector execution workflow failed:', errorMessage);

    // Reconcile application state to failed
    try {
      await reconcileFailure({
        applicationId: params.applicationId,
        error: errorMessage,
        connectorType: params.connectorType,
      });
    } catch (reconcileErr) {
      console.error('Failed to reconcile workflow failure:', reconcileErr);
    }

    return {
      success: false,
      status: 'FAILED',
      error: errorMessage,
      verified: false,
      timestamp,
    };
  }
}
