import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkDuplicate,
  executeATSConnector,
  verifySubmission,
} from './ats-connector.js';
import { db } from '../db/index';
import { applications, receipts } from '../db/schema';

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
        status: 'submitted_verified',
      } as any);

      const result = await checkDuplicate({
        applicationId: 'test-app-id',
        idempotencyKey: 'test-key',
      });

      expect(result.isDuplicate).toBe(true);
      expect(result.existingSubmissionId).toBe('existing-app-id');
    });

    it('should handle database errors', async () => {
      vi.mocked(db.query.applications.findFirst).mockRejectedValueOnce(
        new Error('Database error')
      );

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
      const result = await verifySubmission({
        submissionId: 'submission-123',
        connectorType: 'greenhouse',
      });

      expect(result.verified).toBe(true);
      expect(result.confirmationData).toBeDefined();
      expect(result.confirmationData.submissionId).toBe('submission-123');
      expect(db.update).toHaveBeenCalled();
    });

    it('should handle verification errors', async () => {
      vi.mocked(db.update).mockImplementationOnce(() => {
        throw new Error('Update failed');
      });

      const result = await verifySubmission({
        submissionId: 'submission-123',
        connectorType: 'greenhouse',
      });

      expect(result.verified).toBe(false);
      expect(result.error).toBe('Update failed');
    });
  });
});
