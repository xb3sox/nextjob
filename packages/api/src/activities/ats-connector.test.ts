import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../db/index';
import {
  checkDuplicate,
  checkKillSwitch,
  executeATSConnector,
  reconcileFailure,
  resetKillSwitches,
  setKillSwitch,
  verifySubmission,
} from './ats-connector.js';

// Mock database
vi.mock('../db/index', () => ({
  db: {
    query: {
      applications: {
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([{ id: 'test-receipt-id' }]),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
  },
}));

describe('ATS Connector Activities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetKillSwitches();
  });

  describe('killSwitch', () => {
    it('returns isBlocked: false when kill switch is disabled or not set', async () => {
      const result = await checkKillSwitch({ connectorType: 'greenhouse' });
      expect(result.isBlocked).toBe(false);
      expect(result.reason).toBeUndefined();
    });

    it('returns isBlocked: true when kill switch is enabled for connector', async () => {
      setKillSwitch('greenhouse', true, 'Temporary Greenhouse maintenance');

      const result = await checkKillSwitch({ connectorType: 'greenhouse' });
      expect(result.isBlocked).toBe(true);
      expect(result.reason).toBe('Temporary Greenhouse maintenance');
    });

    it('blocks connector execution when kill switch is engaged', async () => {
      setKillSwitch('workday', true, 'Workday form redesign detected');

      const params = {
        connectorType: 'workday',
        applicationData: {
          resume: 'resume-content',
          answers: {},
          personalInfo: { name: 'Alex Doe', email: 'alex@example.com' },
        },
        jobId: 'job-999',
        userId: 'user-999',
        tenantId: 'tenant-999',
      };

      const result = await executeATSConnector(params);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Kill switch active');
      expect(db.insert).not.toHaveBeenCalled();
    });
  });

  describe('reconcileFailure', () => {
    it('updates application status to failed with error payload', async () => {
      const result = await reconcileFailure({
        applicationId: 'app-fail-1',
        error: 'Connector timed out after 3 retries',
        connectorType: 'lever',
      });

      expect(result.reconciled).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe('checkDuplicate', () => {
    it('should return isDuplicate: false when no existing application', async () => {
      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce(undefined);

      const result = await checkDuplicate({
        applicationId: 'test-app-id',
        idempotencyKey: 'test-key',
      });

      expect(result.isDuplicate).toBe(false);
      expect(result.existingSubmissionId).toBeUndefined();
    });

    it('should return isDuplicate: true when application already submitted', async () => {
      vi.mocked(db.query.applications.findFirst).mockResolvedValueOnce({
        id: 'existing-app-id',
        status: 'submitted',
      } as any);

      const result = await checkDuplicate({
        applicationId: 'test-app-id',
        idempotencyKey: 'test-key',
      });

      expect(result.isDuplicate).toBe(true);
      expect(result.existingSubmissionId).toBe('existing-app-id');
    });

    it('should handle database errors', async () => {
      vi.mocked(db.query.applications.findFirst).mockRejectedValueOnce(new Error('Database error'));

      await expect(
        checkDuplicate({
          applicationId: 'test-app-id',
          idempotencyKey: 'test-key',
        })
      ).rejects.toThrow('Database error');
    });
  });

  describe('executeATSConnector', () => {
    it('should execute connector successfully', async () => {
      const params = {
        connectorType: 'greenhouse',
        applicationData: {
          resume: 'resume-content',
          coverLetter: 'cover-letter-content',
          answers: { question1: 'answer1' },
          personalInfo: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        jobId: 'job-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
      };

      const result = await executeATSConnector(params);

      expect(result.success).toBe(true);
      expect(result.submissionId).toBeDefined();
      expect(result.receiptId).toBeDefined();
      expect(db.insert).toHaveBeenCalled();
    });

    it('should handle connector execution errors', async () => {
      vi.mocked(db.insert).mockImplementationOnce(() => {
        throw new Error('Insert failed');
      });

      const params = {
        connectorType: 'greenhouse',
        applicationData: {
          resume: 'resume-content',
          answers: {},
          personalInfo: {
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
        jobId: 'job-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
      };

      const result = await executeATSConnector(params);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insert failed');
    });
  });

  describe('verifySubmission', () => {
    it('should verify submission successfully', async () => {
      const params = {
        submissionId: 'sub-123',
        connectorType: 'greenhouse',
      };

      const result = await verifySubmission(params);

      expect(result.verified).toBe(true);
      expect(result.confirmationData).toBeDefined();
      expect(db.update).toHaveBeenCalled();
    });

    it('should handle verification errors', async () => {
      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Update failed');
      });

      const params = {
        submissionId: 'sub-123',
        connectorType: 'greenhouse',
      };

      const result = await verifySubmission(params);

      expect(result.verified).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });
});
