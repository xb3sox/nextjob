import { v4 as uuidv4 } from 'uuid';
import {
  type CreateEvidenceRequest,
  type Evidence,
  type EvidenceListResponse,
  EvidenceNotFoundError,
  EvidenceSchema,
  type EvidenceType,
} from './types.js';

// ============================================================================
// Evidence Service
// ============================================================================

/**
 * Service for managing evidence and provenance tracking
 */
export class EvidenceService {
  private evidenceStore: Map<string, Evidence> = new Map();

  /**
   * Create new evidence
   */
  async createEvidence(request: CreateEvidenceRequest): Promise<Evidence> {
    const now = new Date().toISOString();
    const evidenceId = uuidv4();

    const evidence: Evidence = {
      id: evidenceId,
      userId: request.userId,
      tenantId: request.tenantId,
      type: request.type,
      name: request.name,
      description: request.description,
      storageType: request.storageType,
      storageKey: request.storageKey,
      content: request.content,
      mimeType: request.mimeType,
      fileSize: request.fileSize,
      hash: request.hash,
      verified: false,
      createdAt: now,
      updatedAt: now,
      createdBy: request.userId,
      deleted: false,
    };

    // Validate and store
    const validatedEvidence = EvidenceSchema.parse(evidence);
    this.evidenceStore.set(evidenceId, validatedEvidence);

    return validatedEvidence;
  }

  /**
   * Get evidence by ID
   */
  async getEvidence(evidenceId: string): Promise<Evidence> {
    const evidence = this.evidenceStore.get(evidenceId);

    if (!evidence || evidence.deleted) {
      throw new EvidenceNotFoundError(evidenceId);
    }

    return evidence;
  }

  /**
   * Update evidence metadata
   */
  async updateEvidence(
    evidenceId: string,
    updates: {
      name?: string;
      description?: string;
      verified?: boolean;
      verifiedBy?: string;
    },
    userId: string
  ): Promise<Evidence> {
    const evidence = await this.getEvidence(evidenceId);

    const now = new Date().toISOString();
    const updatedEvidence: Evidence = {
      ...evidence,
      name: updates.name ?? evidence.name,
      description: updates.description ?? evidence.description,
      verified: updates.verified ?? evidence.verified,
      verifiedAt: updates.verified ? now : evidence.verifiedAt,
      verifiedBy: updates.verifiedBy ?? evidence.verifiedBy,
      updatedAt: now,
    };

    const validatedEvidence = EvidenceSchema.parse(updatedEvidence);
    this.evidenceStore.set(evidenceId, validatedEvidence);

    return validatedEvidence;
  }

  /**
   * Delete evidence (soft delete)
   */
  async deleteEvidence(evidenceId: string, userId: string): Promise<void> {
    const evidence = await this.getEvidence(evidenceId);

    const now = new Date().toISOString();
    const deletedEvidence: Evidence = {
      ...evidence,
      deleted: true,
      deletedAt: now,
      updatedAt: now,
    };

    this.evidenceStore.set(evidenceId, deletedEvidence);
  }

  /**
   * List evidence for a user
   */
  async listEvidence(
    userId: string,
    tenantId: string,
    options: {
      type?: EvidenceType;
      verified?: boolean;
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<EvidenceListResponse> {
    const { type, verified, page = 1, pageSize = 20 } = options;

    let evidence = Array.from(this.evidenceStore.values()).filter(
      (e) => e.userId === userId && e.tenantId === tenantId && !e.deleted
    );

    // Apply filters
    if (type) {
      evidence = evidence.filter((e) => e.type === type);
    }

    if (verified !== undefined) {
      evidence = evidence.filter((e) => e.verified === verified);
    }

    // Sort by createdAt (newest first)
    evidence.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate
    const total = evidence.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEvidence = evidence.slice(startIndex, endIndex);

    return {
      evidence: paginatedEvidence,
      total,
      page,
      pageSize,
      hasMore: endIndex < total,
    };
  }

  /**
   * Verify evidence
   */
  async verifyEvidence(evidenceId: string, userId: string): Promise<Evidence> {
    return this.updateEvidence(evidenceId, { verified: true, verifiedBy: userId }, userId);
  }

  /**
   * Get evidence by hash (for deduplication)
   */
  async getEvidenceByHash(
    hash: string,
    userId: string,
    tenantId: string
  ): Promise<Evidence | null> {
    const evidence = Array.from(this.evidenceStore.values()).find(
      (e) => e.hash === hash && e.userId === userId && e.tenantId === tenantId && !e.deleted
    );

    return evidence || null;
  }

  /**
   * Calculate evidence coverage for a user
   */
  async calculateEvidenceCoverage(
    userId: string,
    tenantId: string
  ): Promise<{
    totalEvidence: number;
    verifiedEvidence: number;
    coveragePercentage: number;
  }> {
    const { evidence } = await this.listEvidence(userId, tenantId, { pageSize: 1000 });

    const totalEvidence = evidence.length;
    const verifiedEvidence = evidence.filter((e) => e.verified).length;
    const coveragePercentage = totalEvidence > 0 ? (verifiedEvidence / totalEvidence) * 100 : 0;

    return {
      totalEvidence,
      verifiedEvidence,
      coveragePercentage,
    };
  }

  /**
   * Get evidence statistics
   */
  async getEvidenceStats(
    userId: string,
    tenantId: string
  ): Promise<{
    byType: Record<EvidenceType, number>;
    byVerificationStatus: {
      verified: number;
      unverified: number;
    };
    totalSize: number;
  }> {
    const { evidence } = await this.listEvidence(userId, tenantId, { pageSize: 1000 });

    const byType: Record<EvidenceType, number> = {
      resume: 0,
      certificate: 0,
      transcript: 0,
      portfolio: 0,
      reference: 0,
      verification_link: 0,
      other: 0,
    };

    const byVerificationStatus = {
      verified: 0,
      unverified: 0,
    };

    let totalSize = 0;

    for (const e of evidence) {
      byType[e.type]++;

      if (e.verified) {
        byVerificationStatus.verified++;
      } else {
        byVerificationStatus.unverified++;
      }

      if (e.fileSize) {
        totalSize += e.fileSize;
      }
    }

    return {
      byType,
      byVerificationStatus,
      totalSize,
    };
  }
}

// Export singleton instance
export const evidenceService = new EvidenceService();
