import { v4 as uuidv4 } from 'uuid';
import {
  type ClaimListResponse,
  ClaimNotFoundError,
  type ClaimType,
  type CreateClaimRequest,
  InvalidClaimContentError,
  type ProfileClaim,
  ProfileClaimSchema,
  type UpdateClaimRequest,
  type VerifyClaimRequest,
} from './types.js';

// ============================================================================
// Claims Service
// ============================================================================

/**
 * Service for managing profile claims with evidence provenance
 */
export class ClaimsService {
  private claims: Map<string, ProfileClaim> = new Map();

  /**
   * Create a new profile claim
   */
  async createClaim(request: CreateClaimRequest): Promise<ProfileClaim> {
    // Validate content based on claim type
    this.validateClaimContent(request.type, request.content);

    const now = new Date().toISOString();
    const claimId = uuidv4();

    const claim: ProfileClaim = {
      id: claimId,
      userId: request.userId,
      tenantId: request.tenantId,
      type: request.type,
      title: request.title,
      description: request.description,
      evidenceId: request.evidenceId,
      evidenceSource: request.evidenceSource,
      evidenceConfidence: request.evidenceId ? 0.8 : 0.5, // Higher confidence if evidence provided
      verificationStatus: 'unverified',
      version: 1,
      content: request.content,
      createdAt: now,
      updatedAt: now,
      createdBy: request.userId,
      updatedBy: request.userId,
      deleted: false,
    };

    // Validate and store
    const validatedClaim = ProfileClaimSchema.parse(claim);
    this.claims.set(claimId, validatedClaim);

    return validatedClaim;
  }

  /**
   * Get a claim by ID
   */
  async getClaim(claimId: string): Promise<ProfileClaim> {
    const claim = this.claims.get(claimId);

    if (!claim || claim.deleted) {
      throw new ClaimNotFoundError(claimId);
    }

    return claim;
  }

  /**
   * Update a claim (creates a new version)
   */
  async updateClaim(
    claimId: string,
    request: UpdateClaimRequest,
    userId: string
  ): Promise<ProfileClaim> {
    const existingClaim = await this.getClaim(claimId);

    // Validate content if provided
    if (request.content) {
      this.validateClaimContent(existingClaim.type, request.content);
    }

    const now = new Date().toISOString();
    const newVersionId = uuidv4();

    // Create new version
    const updatedClaim: ProfileClaim = {
      ...existingClaim,
      id: newVersionId,
      previousVersionId: existingClaim.id,
      version: existingClaim.version + 1,
      title: request.title ?? existingClaim.title,
      description: request.description ?? existingClaim.description,
      content: request.content ?? existingClaim.content,
      verificationStatus: request.verificationStatus ?? existingClaim.verificationStatus,
      verificationNotes: request.verificationNotes ?? existingClaim.verificationNotes,
      updatedAt: now,
      updatedBy: userId,
    };

    // Validate and store
    const validatedClaim = ProfileClaimSchema.parse(updatedClaim);

    // Mark old version as deleted (soft delete for versioning)
    existingClaim.deleted = true;
    existingClaim.deletedAt = now;

    this.claims.set(newVersionId, validatedClaim);

    return validatedClaim;
  }

  /**
   * Verify a claim
   */
  async verifyClaim(claimId: string, request: VerifyClaimRequest): Promise<ProfileClaim> {
    const claim = await this.getClaim(claimId);

    const now = new Date().toISOString();
    const updatedClaim: ProfileClaim = {
      ...claim,
      verificationStatus: request.verificationStatus,
      verifiedAt: now,
      verifiedBy: request.verifiedBy,
      verificationNotes: request.verificationNotes,
      updatedAt: now,
      updatedBy: request.verifiedBy,
    };

    const validatedClaim = ProfileClaimSchema.parse(updatedClaim);
    this.claims.set(claimId, validatedClaim);

    return validatedClaim;
  }

  /**
   * Delete a claim (soft delete)
   */
  async deleteClaim(claimId: string, userId: string): Promise<void> {
    const claim = await this.getClaim(claimId);

    const now = new Date().toISOString();
    const deletedClaim: ProfileClaim = {
      ...claim,
      deleted: true,
      deletedAt: now,
      updatedAt: now,
      updatedBy: userId,
    };

    this.claims.set(claimId, deletedClaim);
  }

  /**
   * List claims for a user
   */
  async listClaims(
    userId: string,
    tenantId: string,
    options: {
      type?: ClaimType;
      verificationStatus?: string;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<ClaimListResponse> {
    const { type, verificationStatus, page = 1, pageSize = 20 } = options;

    let claims = Array.from(this.claims.values()).filter(
      (claim) => claim.userId === userId && claim.tenantId === tenantId && !claim.deleted
    );

    // Apply filters
    if (type) {
      claims = claims.filter((claim) => claim.type === type);
    }

    if (verificationStatus) {
      claims = claims.filter((claim) => claim.verificationStatus === verificationStatus);
    }

    // Sort by updatedAt (newest first)
    claims.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Paginate
    const total = claims.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedClaims = claims.slice(startIndex, endIndex);

    return {
      claims: paginatedClaims,
      total,
      page,
      pageSize,
      hasMore: endIndex < total,
    };
  }

  /**
   * Get claim history (all versions)
   */
  async getClaimHistory(claimId: string): Promise<ProfileClaim[]> {
    const claim = await this.getClaim(claimId);
    const history: ProfileClaim[] = [claim];

    // Traverse previous versions
    let currentClaim = claim;
    while (currentClaim.previousVersionId) {
      const previousClaim = this.claims.get(currentClaim.previousVersionId);
      if (!previousClaim) break;

      history.unshift(previousClaim);
      currentClaim = previousClaim;
    }

    return history;
  }

  /**
   * Get claims by evidence ID
   */
  async getClaimsByEvidence(
    evidenceId: string,
    userId: string,
    tenantId: string
  ): Promise<ProfileClaim[]> {
    return Array.from(this.claims.values()).filter(
      (claim) =>
        claim.evidenceId === evidenceId &&
        claim.userId === userId &&
        claim.tenantId === tenantId &&
        !claim.deleted
    );
  }

  /**
   * Validate claim content based on type
   */
  private validateClaimContent(type: ClaimType, content: Record<string, any>): void {
    // Basic validation - in production, use type-specific schemas
    if (!content || Object.keys(content).length === 0) {
      throw new InvalidClaimContentError(type, 'Content cannot be empty');
    }

    // Type-specific validation
    switch (type) {
      case 'experience':
        if (!content.company || !content.position) {
          throw new InvalidClaimContentError(type, 'Experience must have company and position');
        }
        break;
      case 'education':
        if (!content.institution || !content.degree) {
          throw new InvalidClaimContentError(type, 'Education must have institution and degree');
        }
        break;
      case 'skill':
        if (!content.name) {
          throw new InvalidClaimContentError(type, 'Skill must have name');
        }
        break;
      case 'certification':
        if (!content.name || !content.issuer) {
          throw new InvalidClaimContentError(type, 'Certification must have name and issuer');
        }
        break;
      case 'project':
        if (!content.name) {
          throw new InvalidClaimContentError(type, 'Project must have name');
        }
        break;
      case 'achievement':
        if (!content.title) {
          throw new InvalidClaimContentError(type, 'Achievement must have title');
        }
        break;
      case 'language':
        if (!content.language || !content.proficiency) {
          throw new InvalidClaimContentError(type, 'Language must have language and proficiency');
        }
        break;
    }
  }

  /**
   * Calculate overall profile confidence score
   */
  async calculateProfileConfidence(userId: string, tenantId: string): Promise<number> {
    const { claims } = await this.listClaims(userId, tenantId, { pageSize: 1000 });

    if (claims.length === 0) return 0;

    const totalConfidence = claims.reduce((sum, claim) => {
      let confidence = claim.evidenceConfidence || 0.5;

      // Boost confidence for verified claims
      if (claim.verificationStatus === 'verified') {
        confidence = Math.min(1, confidence + 0.2);
      }

      // Reduce confidence for unverified claims
      if (claim.verificationStatus === 'unverified') {
        confidence *= 0.8;
      }

      return sum + confidence;
    }, 0);

    return totalConfidence / claims.length;
  }
}

// Export singleton instance
export const claimsService = new ClaimsService();
