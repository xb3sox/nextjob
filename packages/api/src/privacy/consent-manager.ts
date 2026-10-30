import crypto from 'node:crypto';
import type { PrivacyStore } from './privacy-store';
import type { ConsentRecord, PrivacyPreferences, PrivacyPurpose } from './types';

export class ConsentManager {
  constructor(private readonly store: PrivacyStore) {}

  /**
   * Grants consent for a specific processing purpose with versioning.
   */
  async grantConsent(
    tenantId: string,
    userId: string,
    purpose: PrivacyPurpose,
    options: {
      policyVersion?: string;
      retentionDays?: number;
      ipAddress?: string;
      userAgent?: string;
    } = {}
  ): Promise<ConsentRecord> {
    const record: ConsentRecord = {
      id: `consent_${crypto.randomUUID()}`,
      tenantId,
      userId,
      purpose,
      status: 'granted',
      policyVersion: options.policyVersion ?? '2026.1',
      grantedAt: new Date(),
      retentionDays: options.retentionDays ?? 365,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    };

    return this.store.saveConsent(record);
  }

  /**
   * Revokes consent for a specific processing purpose.
   */
  async revokeConsent(
    tenantId: string,
    userId: string,
    purpose: PrivacyPurpose
  ): Promise<ConsentRecord | null> {
    const active = await this.store.findActiveConsent(tenantId, userId, purpose);
    if (!active) return null;

    active.status = 'revoked';
    active.revokedAt = new Date();
    return this.store.saveConsent(active);
  }

  /**
   * Revokes all active consents for a candidate.
   */
  async revokeAllConsents(tenantId: string, userId: string): Promise<ConsentRecord[]> {
    const all = await this.store.findConsentsByUser(tenantId, userId);
    const updated: ConsentRecord[] = [];

    for (const c of all) {
      if (c.status === 'granted') {
        c.status = 'revoked';
        c.revokedAt = new Date();
        await this.store.saveConsent(c);
        updated.push(c);
      }
    }

    return updated;
  }

  /**
   * Purpose limitation check (FR-10, PRD §Privacy Requirements):
   * Verifies if candidate data can be processed for the requested purpose.
   * If consent is not granted, expired, or revoked, processing MUST be blocked.
   */
  async canProcessForPurpose(
    tenantId: string,
    userId: string,
    purpose: PrivacyPurpose
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Check if model learning is disabled
    if (purpose === 'model_training') {
      const isLearningAllowed = await this.isModelLearningEnabled(tenantId, userId);
      if (!isLearningAllowed) {
        return {
          allowed: false,
          reason: 'User has explicitly disabled AI model learning on their candidate data.',
        };
      }
    }

    const consent = await this.store.findActiveConsent(tenantId, userId, purpose);
    if (!consent) {
      return {
        allowed: false,
        reason: `Missing valid, unexpired consent for purpose: '${purpose}'`,
      };
    }

    return { allowed: true };
  }

  /**
   * Checks whether AI model training on candidate data is allowed.
   */
  async isModelLearningEnabled(tenantId: string, userId: string): Promise<boolean> {
    const prefs = await this.store.getPreferences(tenantId, userId);
    if (prefs.disableModelLearning) {
      return false;
    }
    const consent = await this.store.findActiveConsent(tenantId, userId, 'model_training');
    return consent !== null && consent.status === 'granted';
  }

  /**
   * Toggles the AI model learning opt-out setting (FR-10).
   */
  async setModelLearning(
    tenantId: string,
    userId: string,
    enabled: boolean
  ): Promise<PrivacyPreferences> {
    const prefs = await this.store.getPreferences(tenantId, userId);
    prefs.disableModelLearning = !enabled;
    prefs.updatedAt = new Date();

    if (!enabled) {
      // Auto-revoke any active model_training consent
      await this.revokeConsent(tenantId, userId, 'model_training');
    } else {
      // Re-grant consent for model_training
      await this.grantConsent(tenantId, userId, 'model_training');
    }

    return this.store.savePreferences(prefs);
  }
}
