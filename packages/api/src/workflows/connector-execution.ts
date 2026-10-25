import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/ats-connector.js';

// Import activities for workflow execution
const { executeATSConnector, verifySubmission, checkDuplicate } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '5 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '1s',
    backoffCoefficient: 2,
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
  status: 'SUBMITTED' | 'FAILED' | 'DUPLICATE' | 'TIMEOUT';
  error?: string;
  verified: boolean;
  timestamp: string;
}

// ============================================================================
// Connector Execution Workflow
// ============================================================================

/**
 * Main workflow for executing ATS connector
 * Handles the complete lifecycle of job application submission
 */
export async function connectorExecutionWorkflow(
  params: ConnectorExecutionParams
): Promise<ConnectorExecutionResult> {
  const _startTime = new Date().toISOString();

  try {
    // Step 1: Check for duplicates (idempotency)
    const duplicateCheck = await checkDuplicate({
      applicationId: params.applicationId,
      idempotencyKey: params.idempotencyKey,
    });

    if (duplicateCheck.isDuplicate) {
      return {
        success: false,
        status: 'DUPLICATE',
        error: 'Application already submitted',
        verified: true,
        timestamp: new Date().toISOString(),
      };
    }

    // Step 2: Execute the ATS connector
    const executionResult = await executeATSConnector({
      connectorType: params.connectorType,
      applicationData: params.applicationData,
      jobId: params.jobId,
      userId: params.userId,
      tenantId: params.tenantId,
    });

    if (!executionResult.success) {
      return {
        success: false,
        status: 'FAILED',
        error: executionResult.error,
        verified: false,
        timestamp: new Date().toISOString(),
      };
    }

    // Step 3: Verify the submission
    const verificationResult = await verifySubmission({
      submissionId: executionResult.submissionId!,
      connectorType: params.connectorType,
    });

    return {
      success: true,
      submissionId: executionResult.submissionId,
      receiptId: executionResult.receiptId,
      status: 'SUBMITTED',
      verified: verificationResult.verified,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Connector execution workflow failed:', error);

    return {
      success: false,
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
      verified: false,
      timestamp: new Date().toISOString(),
    };
  }
}
