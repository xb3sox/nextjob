import { beforeEach, describe, expect, it, vi } from 'vitest';
import { claimsService } from '../claims/claims-service.js';
import { ClaimNotFoundError, InvalidVerificationActionError } from './types.js';
import { VerificationService } from './verification-service.js';

// Mock claims service
vi.mock('../claims/claims-service.js', () => ({
  claimsService: {
    getClaim: vi.fn(),
    verifyClaim: vi.fn(),
    updateClaim: vi.fn(),
    deleteClaim: vi.fn(),
    listClaims: vi.fn(),
  },
}));

describe('VerificationService', () => {
  let service: VerificationService;

  beforeEach(() => {
    service = new VerificationService();
    vi.clearAllMocks();
  });

  describe('verifyClaim', () => {
    it('should confirm an unverified claim', async () => {
      const mockClaim = {
        id: 'claim-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
        verificationStatus: 'unverified',
        version: 1,
      };

      vi.mocked(claimsService.getClaim).mockResolvedValue(mockClaim as any);
      vi.mocked(claimsService.verifyClaim).mockResolvedValue({
        ...mockClaim,
        verificationStatus: 'verified',
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'user-456',
      } as any);

      const result = await service.verifyClaim({
        claimId: 'claim-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
        action: 'confirm',
        notes: 'Confirmed by user',
      });

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('verified');
      expect(result.previousStatus).toBe('unverified');
      expect(claimsService.verifyClaim).toHaveBeenCalledWith('claim-123', {
        verificationStatus: 'verified',
        verifiedBy: 'user-456',
        verificationNotes: 'Confirmed by user',
      });
    });

    it('should edit a claim and set status to pending_review', async () => {
      const mockClaim = {
        id: 'claim-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
        verificationStatus: 'verified',
        version: 1,
      };

      const updatedClaim = {
        ...mockClaim,
        id: 'claim-124',
        version: 2,
        verificationStatus: 'pending_review',
      };

      vi.mocked(claimsService.getClaim).mockResolvedValue(mockClaim as any);
      vi.mocked(claimsService.updateClaim).mockResolvedValue(updatedClaim as any);

      const result = await service.verifyClaim({
        claimId: 'claim-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
        action: 'edit',
        editedContent: { title: 'Updated Title' },
        notes: 'Edited by user',
      });

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('pending_review');
      expect(result.version).toBe(2);
    });

    it('should remove a claim', async () => {
      const mockClaim = {
        id: 'claim-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
        verificationStatus: 'unverified',
        version: 1,
      };

      vi.mocked(claimsService.getClaim).mockResolvedValue(mockClaim as any);
      vi.mocked(claimsService.deleteClaim).mockResolvedValue(undefined);

      const result = await service.verifyClaim({
        claimId: 'claim-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
        action: 'remove',
        notes: 'Removed by user',
      });

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('removed');
      expect(claimsService.deleteClaim).toHaveBeenCalledWith('claim-123', 'user-456');
    });

    it('should mark a claim as unverified', async () => {
      const mockClaim = {
        id: 'claim-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
        verificationStatus: 'verified',
        version: 1,
      };

      vi.mocked(claimsService.getClaim).mockResolvedValue(mockClaim as any);
      vi.mocked(claimsService.verifyClaim).mockResolvedValue({
        ...mockClaim,
        verificationStatus: 'unverified',
      } as any);

      const result = await service.verifyClaim({
        claimId: 'claim-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
        action: 'mark_unverified',
        notes: 'Needs review',
      });

      expect(result.success).toBe(true);
      expect(result.newStatus).toBe('unverified');
    });

    it('should throw error if claim not found', async () => {
      vi.mocked(claimsService.getClaim).mockRejectedValue(new ClaimNotFoundError('claim-123'));

      await expect(
        service.verifyClaim({
          claimId: 'claim-123',
          userId: 'user-456',
          tenantId: 'tenant-789',
          action: 'confirm',
        })
      ).rejects.toThrow(ClaimNotFoundError);
    });

    it('should throw error if claim belongs to different user', async () => {
      const mockClaim = {
        id: 'claim-123',
        userId: 'different-user',
        tenantId: 'tenant-789',
        verificationStatus: 'unverified',
      };

      vi.mocked(claimsService.getClaim).mockResolvedValue(mockClaim as any);

      await expect(
        service.verifyClaim({
          claimId: 'claim-123',
          userId: 'user-456',
          tenantId: 'tenant-789',
          action: 'confirm',
        })
      ).rejects.toThrow(ClaimNotFoundError);
    });

    it('should throw error when editing without content', async () => {
      const mockClaim = {
        id: 'claim-123',
        userId: 'user-456',
        tenantId: 'tenant-789',
        verificationStatus: 'unverified',
      };

      vi.mocked(claimsService.getClaim).mockResolvedValue(mockClaim as any);

      await expect(
        service.verifyClaim({
          claimId: 'claim-123',
          userId: 'user-456',
          tenantId: 'tenant-789',
          action: 'edit',
        })
      ).rejects.toThrow(InvalidVerificationActionError);
    });
  });

  describe('verifyBulk', () => {
    it('should verify multiple claims', async () => {
      const mockClaim1 = {
        id: 'claim-1',
        userId: 'user-456',
        tenantId: 'tenant-789',
        verificationStatus: 'unverified',
        version: 1,
      };

      const mockClaim2 = {
        id: 'claim-2',
        userId: 'user-456',
        tenantId: 'tenant-789',
        verificationStatus: 'unverified',
        version: 1,
      };

      vi.mocked(claimsService.getClaim)
        .mockResolvedValueOnce(mockClaim1 as any)
        .mockResolvedValueOnce(mockClaim2 as any);

      vi.mocked(claimsService.verifyClaim).mockResolvedValue({
        ...mockClaim1,
        verificationStatus: 'verified',
      } as any);

      const result = await service.verifyBulk({
        userId: 'user-456',
        tenantId: 'tenant-789',
        claims: [
          { claimId: 'claim-1', action: 'confirm' },
          { claimId: 'claim-2', action: 'confirm' },
        ],
      });

      expect(result.total).toBe(2);
      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should handle partial failures in bulk verification', async () => {
      const mockClaim = {
        id: 'claim-1',
        userId: 'user-456',
        tenantId: 'tenant-789',
        verificationStatus: 'unverified',
        version: 1,
      };

      vi.mocked(claimsService.getClaim)
        .mockResolvedValueOnce(mockClaim as any)
        .mockRejectedValueOnce(new ClaimNotFoundError('claim-2'));

      const result = await service.verifyBulk({
        userId: 'user-456',
        tenantId: 'tenant-789',
        claims: [
          { claimId: 'claim-1', action: 'confirm' },
          { claimId: 'claim-2', action: 'confirm' },
        ],
      });

      expect(result.total).toBe(2);
      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('getPendingVerifications', () => {
    it('should return unverified claims', async () => {
      const mockClaims = [
        { id: 'claim-1', verificationStatus: 'unverified' },
        { id: 'claim-2', verificationStatus: 'unverified' },
      ];

      vi.mocked(claimsService.listClaims).mockResolvedValue({
        claims: mockClaims as any,
        total: 2,
        page: 1,
        pageSize: 100,
        hasMore: false,
      });

      const result = await service.getPendingVerifications('user-456', 'tenant-789');

      expect(result.claims).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(claimsService.listClaims).toHaveBeenCalledWith('user-456', 'tenant-789', {
        verificationStatus: 'unverified',
        pageSize: 100,
      });
    });
  });

  describe('getVerificationStats', () => {
    it('should calculate verification statistics', async () => {
      const mockClaims = [
        { verificationStatus: 'verified' },
        { verificationStatus: 'verified' },
        { verificationStatus: 'unverified' },
        { verificationStatus: 'rejected' },
      ];

      vi.mocked(claimsService.listClaims).mockResolvedValue({
        claims: mockClaims as any,
        total: 4,
        page: 1,
        pageSize: 1000,
        hasMore: false,
      });

      const stats = await service.getVerificationStats('user-456', 'tenant-789');

      expect(stats.total).toBe(4);
      expect(stats.verified).toBe(2);
      expect(stats.unverified).toBe(1);
      expect(stats.rejected).toBe(1);
      expect(stats.verificationRate).toBe(50);
    });

    it('should handle empty claims list', async () => {
      vi.mocked(claimsService.listClaims).mockResolvedValue({
        claims: [],
        total: 0,
        page: 1,
        pageSize: 1000,
        hasMore: false,
      });

      const stats = await service.getVerificationStats('user-456', 'tenant-789');

      expect(stats.total).toBe(0);
      expect(stats.verificationRate).toBe(0);
    });
  });
});
