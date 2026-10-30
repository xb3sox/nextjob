import crypto from 'node:crypto';
import { ConsentManager } from './consent-manager';
import { PrivacyStore } from './privacy-store';
import type {
  CandidateDataView,
  DataCorrectionRequest,
  DataDeletionReceipt,
  DataExport,
  PrivacyPreferences,
} from './types';

export class PrivacyService {
  public readonly consentManager: ConsentManager;

  constructor(public readonly store: PrivacyStore = new PrivacyStore()) {
    this.consentManager = new ConsentManager(this.store);
  }

  /**
   * 1. VIEW DATA (FR-10):
   * Retrieves complete candidate data view across all domains.
   */
  async viewData(tenantId: string, userId: string): Promise<CandidateDataView> {
    return this.store.getCandidateData(tenantId, userId);
  }

  /**
   * 2. CORRECT DATA (FR-10):
   * Records a user correction on a specific candidate field with audit metadata.
   */
  async correctData(
    tenantId: string,
    userId: string,
    field: string,
    newValue: unknown,
    previousValue: unknown,
    reason?: string
  ): Promise<DataCorrectionRequest> {
    const correction: DataCorrectionRequest = {
      id: `corr_${crypto.randomUUID()}`,
      tenantId,
      userId,
      field,
      previousValue,
      newValue,
      reason,
      timestamp: new Date(),
    };

    return this.store.recordCorrection(correction);
  }

  /**
   * 3. EXPORT DATA (FR-10):
   * Generates a portable, structured JSON archive with SHA-256 integrity checksum.
   */
  async exportData(tenantId: string, userId: string): Promise<DataExport> {
    const candidateData = await this.store.getCandidateData(tenantId, userId);
    const exportedAt = new Date().toISOString();

    // Deterministic payload serialization for checksum
    const serialized = JSON.stringify({
      formatVersion: '1.0.0',
      exportedAt,
      tenantId,
      userId,
      candidateData,
    });

    const sha256Checksum = crypto.createHash('sha256').update(serialized).digest('hex');

    return {
      formatVersion: '1.0.0',
      exportedAt,
      tenantId,
      userId,
      candidateData,
      sha256Checksum,
    };
  }

  /**
   * 4. DELETE DATA (FR-10):
   * Cascading hard deletion across all data, claims, evidence, and applications.
   * Produces an immutable, verifiable DataDeletionReceipt.
   */
  async deleteData(tenantId: string, userId: string): Promise<DataDeletionReceipt> {
    const requestedAt = new Date().toISOString();

    // Execute cascading hard deletion
    const recordsDeleted = await this.store.executeCascadingDeletion(tenantId, userId);

    const completedAt = new Date().toISOString();
    const deletionId = `del_${crypto.randomUUID()}`;

    // Cryptographic verification hash confirming deletion execution
    const verificationPayload = `${deletionId}:${tenantId}:${userId}:${completedAt}:${JSON.stringify(recordsDeleted)}`;
    const verificationHash = crypto.createHash('sha256').update(verificationPayload).digest('hex');

    return {
      deletionId,
      userId,
      tenantId,
      requestedAt,
      completedAt,
      recordsDeleted,
      verificationHash,
      status: 'completed',
    };
  }

  /**
   * 5. DISCONNECT INTEGRATION (FR-10):
   * Disconnects external ATS connector / OAuth integration.
   */
  async disconnectIntegration(
    tenantId: string,
    userId: string,
    provider: string
  ): Promise<{ disconnected: boolean; provider: string }> {
    const removed = await this.store.removeConnectedAccount(tenantId, userId, provider);
    return {
      disconnected: removed,
      provider,
    };
  }

  /**
   * 6. PRIVACY PREFERENCES & MODEL LEARNING (FR-10):
   */
  async getPreferences(tenantId: string, userId: string): Promise<PrivacyPreferences> {
    return this.store.getPreferences(tenantId, userId);
  }

  async updatePreferences(
    tenantId: string,
    userId: string,
    updates: Partial<Omit<PrivacyPreferences, 'userId' | 'tenantId' | 'updatedAt'>>
  ): Promise<PrivacyPreferences> {
    const current = await this.store.getPreferences(tenantId, userId);
    const updated: PrivacyPreferences = {
      ...current,
      ...updates,
      updatedAt: new Date(),
    };

    if (updates.disableModelLearning !== undefined) {
      await this.consentManager.setModelLearning(tenantId, userId, !updates.disableModelLearning);
    }

    return this.store.savePreferences(updated);
  }
}
