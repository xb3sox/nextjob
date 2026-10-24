import { claimsService } from '../claims/claims-service.js';
import {
  type BulkVerificationRequest,
  type BulkVerificationResult,
  ClaimAlreadyVerifiedError,
  ClaimNotFoundError,
  InvalidVerificationActionError,
  type VerificationRequest,
  type VerificationResult,
} from './types.js';

// ============================================================================
// Verification Service
// ============================================================================

/**
 * Service for managing claim verification workflow
 */
export class VerificationService {
  /**
   * Verify a single claim
   */
  async verifyClaim(request: VerificationRequest): Promise<VerificationResult> {
    const { claimId, userId, tenantId, action, editedContent, notes } = request;

    // Get current claim
    const currentClaim = await claimsService.getClaim(claimId);

    // Validate claim belongs to user and tenant
    if (currentClaim.userId !== userId || currentClaim.tenantId !== tenantId) {
      throw new ClaimNotFoundError(claimId);
    }

    // Validate action based on current status
    this.validateAction(action, currentClaim.verificationStatus);

    // Perform verification action
    let result: VerificationResult;

    switch (action) {
      case 'confirm':
        result = await this.confirmClaim(claimId, userId, notes);
        break;
      case 'edit':
        if (!editedContent) {
          throw new InvalidVerificationActionError('edit', 'No content provided');
        }
        result = await this.editClaim(claimId, userId, editedContent, notes);
        break;
      case 'remove':
        result = await this.removeClaim(claimId, userId, notes);
        break;
      case 'mark_unverified':
        result = await this.markUnverified(claimId, userId, notes);
        break;
      default:
        throw new InvalidVerificationActionError(action, currentClaim.verificationStatus);
    }

    return result;
  }

  /**
   * Verify multiple claims in bulk
   */
  async verifyBulk(request: BulkVerificationRequest): Promise<BulkVerificationResult> {
    const { userId, tenantId, claims } = request;

    const results: VerificationResult[] = [];
    const errors: Array<{ claimId: string; error: string }> = [];

    for (const claim of claims) {
      try {
        const result = await this.verifyClaim({
          claimId: claim.claimId,
          userId,
          tenantId,
          action: claim.action,
          editedContent: claim.editedContent,
          notes: claim.notes,
        });
        results.push(result);
      } catch (error) {
        errors.push({
          claimId: claim.claimId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      total: claims.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  /**
   * Get pending verification claims for a user
   */
  async getPendingVerifications(userId: string, tenantId: string) {
    const { claims } = await claimsService.listClaims(userId, tenantId, {
      verificationStatus: 'unverified',
      pageSize: 100,
    });

    return {
      claims,
      total: claims.length,
    };
  }

  /**
   * Get verification statistics for a user
   */
  async getVerificationStats(userId: string, tenantId: string) {
    const { claims: allClaims } = await claimsService.listClaims(userId, tenantId, {
      pageSize: 1000,
    });

    const stats = {
      total: allClaims.length,
      verified: allClaims.filter((c) => c.verificationStatus === 'verified').length,
      unverified: allClaims.filter((c) => c.verificationStatus === 'unverified').length,
      rejected: allClaims.filter((c) => c.verificationStatus === 'rejected').length,
      pendingReview: allClaims.filter((c) => c.verificationStatus === 'pending_review').length,
      verificationRate: 0,
    };

    stats.verificationRate = stats.total > 0 ? (stats.verified / stats.total) * 100 : 0;

    return stats;
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Validate verification action based on current status
   */
  private validateAction(action: string, currentStatus: string): void {
    // Can't confirm an already verified claim
    if (action === 'confirm' && currentStatus === 'verified') {
      throw new ClaimAlreadyVerifiedError('claim');
    }

    // Can't remove a verified claim (should unverify first)
    if (action === 'remove' && currentStatus === 'verified') {
      throw new InvalidVerificationActionError(action, currentStatus);
    }
  }

  /**
   * Confirm a claim
   */
  private async confirmClaim(
    claimId: string,
    userId: string,
    notes?: string
  ): Promise<VerificationResult> {
    const claim = await claimsService.getClaim(claimId);
    const now = new Date().toISOString();

    await claimsService.verifyClaim(claimId, {
      verificationStatus: 'verified',
      verifiedBy: userId,
      verificationNotes: notes || 'Confirmed by user',
    });

    return {
      success: true,
      claimId,
      previousStatus: claim.verificationStatus,
      newStatus: 'verified',
      version: claim.version,
      verifiedAt: now,
      verifiedBy: userId,
      notes,
    };
  }

  /**
   * Edit a claim (creates new version)
   */
  private async editClaim(
    claimId: string,
    userId: string,
    editedContent: Record<string, any>,
    notes?: string
  ): Promise<VerificationResult> {
    const claim = await claimsService.getClaim(claimId);

    // Update claim with new content
    const updatedClaim = await claimsService.updateClaim(
      claimId,
      {
        content: editedContent,
        verificationStatus: 'pending_review',
        verificationNotes: notes || 'Edited by user - pending review',
      },
      userId
    );

    const now = new Date().toISOString();

    return {
      success: true,
      claimId: updatedClaim.id,
      previousStatus: claim.verificationStatus,
      newStatus: 'pending_review',
      version: updatedClaim.version,
      verifiedAt: now,
      verifiedBy: userId,
      notes,
    };
  }

  /**
   * Remove a claim (soft delete)
   */
  private async removeClaim(
    claimId: string,
    userId: string,
    notes?: string
  ): Promise<VerificationResult> {
    const claim = await claimsService.getClaim(claimId);

    await claimsService.deleteClaim(claimId, userId);

    const now = new Date().toISOString();

    return {
      success: true,
      claimId,
      previousStatus: claim.verificationStatus,
      newStatus: 'removed',
      version: claim.version,
      verifiedAt: now,
      verifiedBy: userId,
      notes: notes || 'Removed by user',
    };
  }

  /**
   * Mark a claim as unverified
   */
  private async markUnverified(
    claimId: string,
    userId: string,
    notes?: string
  ): Promise<VerificationResult> {
    const claim = await claimsService.getClaim(claimId);

    await claimsService.verifyClaim(claimId, {
      verificationStatus: 'unverified',
      verifiedBy: userId,
      verificationNotes: notes || 'Marked as unverified by user',
    });

    const now = new Date().toISOString();

    return {
      success: true,
      claimId,
      previousStatus: claim.verificationStatus,
      newStatus: 'unverified',
      version: claim.version,
      verifiedAt: now,
      verifiedBy: userId,
      notes,
    };
  }
}

// Export singleton instance
export const verificationService = new VerificationService();
