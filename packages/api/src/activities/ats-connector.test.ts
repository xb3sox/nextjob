import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../db/index';
import { checkDuplicate, executeATSConnector, verifySubmission } from './ats-connector.js';

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
      vi.mocked(db.query.applications.findFirst).mockRejectedValueOnce(new Error('Database error'));

      await expect(
        checkDuplicate({
          applicationId: 'test-app-id',
          idempotencyKey: 'test-key',
        })
      ).rejects.toThrow('Database error');
    });
  });

  it('does not report a simulated submission or write a receipt', async () => {
    const result = await executeATSConnector({
      connectorType: 'greenhouse',
      applicationData: {
        resume: 'resume',
        answers: {},
        personalInfo: { name: 'Jane', email: 'jane@example.com' },
      },
      jobId: 'job',
      userId: 'user',
      tenantId: 'tenant',
    });
    expect(result).toEqual({ success: false, error: 'ATS connector is not implemented' });
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('does not fabricate a verification', async () => {
    const result = await verifySubmission({
      submissionId: 'submission',
      connectorType: 'greenhouse',
    });
    expect(result).toEqual({
      verified: false,
      error: 'ATS submission verification is not implemented',
    });
    expect(db.update).not.toHaveBeenCalled();
  });
});
