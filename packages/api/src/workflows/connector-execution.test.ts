import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockActivities } = vi.hoisted(() => ({
  mockActivities: {
    checkKillSwitch: vi.fn(),
    checkDuplicate: vi.fn(),
    executeATSConnector: vi.fn(),
    verifySubmission: vi.fn(),
    reconcileFailure: vi.fn(),
  },
}));

vi.mock('@temporalio/workflow', () => ({
  proxyActivities: vi.fn(() => mockActivities),
}));

import {
  type ConnectorExecutionParams,
  connectorExecutionWorkflow,
} from './connector-execution.js';

const MOCK_PARAMS: ConnectorExecutionParams = {
  applicationId: 'app-uuid-1',
  userId: 'user-uuid-1',
  tenantId: 'tenant-uuid-1',
  jobId: 'job-uuid-1',
  connectorType: 'greenhouse',
  applicationData: {
    resume: 'Resume content with verified career claims',
    coverLetter: 'Tailored cover letter grounded in evidence',
    answers: { question_1: '5 years of TypeScript' },
    personalInfo: {
      name: 'Maya Lin',
      email: 'maya@example.com',
      phone: '+1-555-0188',
    },
  },
  idempotencyKey: 'idem-key-workflow-001',
};

describe('connectorExecutionWorkflow (T-24, FR-05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('orchestrates complete successful submission lifecycle with verified receipt', async () => {
    mockActivities.checkKillSwitch.mockResolvedValueOnce({ isBlocked: false });
    mockActivities.checkDuplicate.mockResolvedValueOnce({ isDuplicate: false });
    mockActivities.executeATSConnector.mockResolvedValueOnce({
      success: true,
      submissionId: 'sub-1234',
      receiptId: 'rcpt-5678',
    });
    mockActivities.verifySubmission.mockResolvedValueOnce({
      verified: true,
      confirmationData: { confirmed: true },
    });

    const result = await connectorExecutionWorkflow(MOCK_PARAMS);

    expect(result.success).toBe(true);
    expect(result.status).toBe('SUBMITTED');
    expect(result.submissionId).toBe('sub-1234');
    expect(result.receiptId).toBe('rcpt-5678');
    expect(result.verified).toBe(true);

    expect(mockActivities.checkKillSwitch).toHaveBeenCalledWith({ connectorType: 'greenhouse' });
    expect(mockActivities.checkDuplicate).toHaveBeenCalledWith({
      applicationId: 'app-uuid-1',
      idempotencyKey: 'idem-key-workflow-001',
    });
    expect(mockActivities.executeATSConnector).toHaveBeenCalled();
    expect(mockActivities.verifySubmission).toHaveBeenCalledWith({
      submissionId: 'sub-1234',
      connectorType: 'greenhouse',
    });
  });

  it('halts execution when kill switch is active for connector', async () => {
    mockActivities.checkKillSwitch.mockResolvedValueOnce({
      isBlocked: true,
      reason: 'Greenhouse connector UI change under maintenance',
    });
    mockActivities.reconcileFailure.mockResolvedValueOnce({ reconciled: true });

    const result = await connectorExecutionWorkflow(MOCK_PARAMS);

    expect(result.success).toBe(false);
    expect(result.status).toBe('KILL_SWITCH_BLOCKED');
    expect(result.error).toContain('Greenhouse connector UI change under maintenance');
    expect(result.verified).toBe(false);

    // Connector execution and duplicate checks are skipped
    expect(mockActivities.executeATSConnector).not.toHaveBeenCalled();
    expect(mockActivities.checkDuplicate).not.toHaveBeenCalled();

    // Reconcile failure is recorded
    expect(mockActivities.reconcileFailure).toHaveBeenCalledWith({
      applicationId: 'app-uuid-1',
      error: 'Greenhouse connector UI change under maintenance',
      connectorType: 'greenhouse',
    });
  });

  it('prevents duplicate application submission and returns existing submission ID (FR-05, AC-05)', async () => {
    mockActivities.checkKillSwitch.mockResolvedValueOnce({ isBlocked: false });
    mockActivities.checkDuplicate.mockResolvedValueOnce({
      isDuplicate: true,
      existingSubmissionId: 'prior-submission-999',
    });

    const result = await connectorExecutionWorkflow(MOCK_PARAMS);

    expect(result.success).toBe(false);
    expect(result.status).toBe('DUPLICATE');
    expect(result.submissionId).toBe('prior-submission-999');
    expect(result.verified).toBe(true);

    // Execution should never run on duplicate
    expect(mockActivities.executeATSConnector).not.toHaveBeenCalled();
    expect(mockActivities.verifySubmission).not.toHaveBeenCalled();
  });

  it('reconciles failure when ATS connector execution fails', async () => {
    mockActivities.checkKillSwitch.mockResolvedValueOnce({ isBlocked: false });
    mockActivities.checkDuplicate.mockResolvedValueOnce({ isDuplicate: false });
    mockActivities.executeATSConnector.mockResolvedValueOnce({
      success: false,
      error: 'ATS rate limit exceeded or session expired',
    });
    mockActivities.reconcileFailure.mockResolvedValueOnce({ reconciled: true });

    const result = await connectorExecutionWorkflow(MOCK_PARAMS);

    expect(result.success).toBe(false);
    expect(result.status).toBe('FAILED');
    expect(result.error).toBe('ATS rate limit exceeded or session expired');
    expect(result.verified).toBe(false);

    expect(mockActivities.reconcileFailure).toHaveBeenCalledWith({
      applicationId: 'app-uuid-1',
      error: 'ATS rate limit exceeded or session expired',
      connectorType: 'greenhouse',
    });
  });

  it('catches unexpected activity exceptions and reconciles failure', async () => {
    mockActivities.checkKillSwitch.mockResolvedValueOnce({ isBlocked: false });
    mockActivities.checkDuplicate.mockRejectedValueOnce(new Error('PostgreSQL timeout'));
    mockActivities.reconcileFailure.mockResolvedValueOnce({ reconciled: true });

    const result = await connectorExecutionWorkflow(MOCK_PARAMS);

    expect(result.success).toBe(false);
    expect(result.status).toBe('FAILED');
    expect(result.error).toBe('PostgreSQL timeout');

    expect(mockActivities.reconcileFailure).toHaveBeenCalledWith({
      applicationId: 'app-uuid-1',
      error: 'PostgreSQL timeout',
      connectorType: 'greenhouse',
    });
  });
});
