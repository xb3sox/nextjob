import type {
  CandidateDataView,
  ConnectedAccount,
  ConsentRecord,
  DataCorrectionRequest,
  PrivacyPreferences,
  PrivacyPurpose,
} from './types';

export class PrivacyStore {
  private consents: Map<string, ConsentRecord> = new Map();
  private preferences: Map<string, PrivacyPreferences> = new Map();
  private connectedAccounts: Map<string, ConnectedAccount[]> = new Map();
  private corrections: Map<string, DataCorrectionRequest[]> = new Map();

  // Storage for mock/seeded user domains (used in tests and fallback)
  private profiles: Map<string, Record<string, unknown>> = new Map();
  private claims: Map<string, Array<Record<string, unknown>>> = new Map();
  private evidence: Map<string, Array<Record<string, unknown>>> = new Map();
  private applications: Map<string, Array<Record<string, unknown>>> = new Map();
  private receipts: Map<string, Array<Record<string, unknown>>> = new Map();
  private tokens: Map<string, Array<Record<string, unknown>>> = new Map();

  private makeKey(tenantId: string, userId: string): string {
    return `${tenantId}:${userId}`;
  }

  // Consent Management
  async saveConsent(consent: ConsentRecord): Promise<ConsentRecord> {
    this.consents.set(consent.id, consent);
    return consent;
  }

  async findConsentsByUser(tenantId: string, userId: string): Promise<ConsentRecord[]> {
    return Array.from(this.consents.values()).filter(
      (c) => c.tenantId === tenantId && c.userId === userId
    );
  }

  async findActiveConsent(
    tenantId: string,
    userId: string,
    purpose: PrivacyPurpose
  ): Promise<ConsentRecord | null> {
    const userConsents = await this.findConsentsByUser(tenantId, userId);
    const active = userConsents
      .filter((c) => c.purpose === purpose && c.status === 'granted')
      .sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime())[0];

    if (!active) return null;

    // Check expiration by retention days
    const expirationDate = new Date(
      active.grantedAt.getTime() + active.retentionDays * 24 * 60 * 60 * 1000
    );
    if (expirationDate < new Date()) {
      active.status = 'expired';
      this.consents.set(active.id, active);
      return null;
    }

    return active;
  }

  // Preferences Management
  async getPreferences(tenantId: string, userId: string): Promise<PrivacyPreferences> {
    const key = this.makeKey(tenantId, userId);
    const existing = this.preferences.get(key);
    if (existing) return existing;

    const defaultPrefs: PrivacyPreferences = {
      tenantId,
      userId,
      disableModelLearning: false,
      allowRecruiterContact: false,
      allowAggregatedAnalytics: true,
      retentionDays: 365,
      updatedAt: new Date(),
    };
    this.preferences.set(key, defaultPrefs);
    return defaultPrefs;
  }

  async savePreferences(preferences: PrivacyPreferences): Promise<PrivacyPreferences> {
    const key = this.makeKey(preferences.tenantId, preferences.userId);
    this.preferences.set(key, preferences);
    return preferences;
  }

  // Connected Accounts
  async getConnectedAccounts(tenantId: string, userId: string): Promise<ConnectedAccount[]> {
    const key = this.makeKey(tenantId, userId);
    return this.connectedAccounts.get(key) ?? [];
  }

  async addConnectedAccount(
    tenantId: string,
    userId: string,
    account: ConnectedAccount
  ): Promise<ConnectedAccount[]> {
    const key = this.makeKey(tenantId, userId);
    const existing = this.connectedAccounts.get(key) ?? [];
    const updated = [...existing.filter((a) => a.provider !== account.provider), account];
    this.connectedAccounts.set(key, updated);
    return updated;
  }

  async removeConnectedAccount(
    tenantId: string,
    userId: string,
    provider: string
  ): Promise<boolean> {
    const key = this.makeKey(tenantId, userId);
    const existing = this.connectedAccounts.get(key) ?? [];
    const filtered = existing.filter((a) => a.provider.toLowerCase() !== provider.toLowerCase());
    this.connectedAccounts.set(key, filtered);
    return filtered.length < existing.length;
  }

  // Data Corrections
  async recordCorrection(request: DataCorrectionRequest): Promise<DataCorrectionRequest> {
    const key = this.makeKey(request.tenantId, request.userId);
    const existing = this.corrections.get(key) ?? [];
    existing.push(request);
    this.corrections.set(key, existing);
    return request;
  }

  async getCorrections(tenantId: string, userId: string): Promise<DataCorrectionRequest[]> {
    const key = this.makeKey(tenantId, userId);
    return this.corrections.get(key) ?? [];
  }

  // Domain records seeding (for data viewing / testing)
  seedUserData(
    tenantId: string,
    userId: string,
    data: {
      profile?: Record<string, unknown>;
      claims?: Array<Record<string, unknown>>;
      evidence?: Array<Record<string, unknown>>;
      applications?: Array<Record<string, unknown>>;
      receipts?: Array<Record<string, unknown>>;
      tokens?: Array<Record<string, unknown>>;
    }
  ): void {
    const key = this.makeKey(tenantId, userId);
    if (data.profile) this.profiles.set(key, data.profile);
    if (data.claims) this.claims.set(key, data.claims);
    if (data.evidence) this.evidence.set(key, data.evidence);
    if (data.applications) this.applications.set(key, data.applications);
    if (data.receipts) this.receipts.set(key, data.receipts);
    if (data.tokens) this.tokens.set(key, data.tokens);
  }

  async getCandidateData(tenantId: string, userId: string): Promise<CandidateDataView> {
    const key = this.makeKey(tenantId, userId);
    const profile = this.profiles.get(key) ?? { id: userId, email: 'candidate@example.com' };
    const claims = this.claims.get(key) ?? [];
    const evidence = this.evidence.get(key) ?? [];
    const applications = this.applications.get(key) ?? [];
    const receipts = this.receipts.get(key) ?? [];
    const consents = await this.findConsentsByUser(tenantId, userId);
    const preferences = await this.getPreferences(tenantId, userId);
    const connectedAccounts = await this.getConnectedAccounts(tenantId, userId);

    return {
      userId,
      tenantId,
      profile,
      claims,
      evidence,
      applications,
      receipts,
      consents,
      preferences,
      connectedAccounts,
    };
  }

  // Cascading Hard Deletion
  async executeCascadingDeletion(
    tenantId: string,
    userId: string
  ): Promise<{
    profile: number;
    claims: number;
    evidence: number;
    applications: number;
    receipts: number;
    tokens: number;
    consents: number;
  }> {
    const key = this.makeKey(tenantId, userId);

    const counts = {
      profile: this.profiles.has(key) ? 1 : 0,
      claims: (this.claims.get(key) ?? []).length,
      evidence: (this.evidence.get(key) ?? []).length,
      applications: (this.applications.get(key) ?? []).length,
      receipts: (this.receipts.get(key) ?? []).length,
      tokens: (this.tokens.get(key) ?? []).length,
      consents: 0,
    };

    // Delete all domain data
    this.profiles.delete(key);
    this.claims.delete(key);
    this.evidence.delete(key);
    this.applications.delete(key);
    this.receipts.delete(key);
    this.tokens.delete(key);
    this.connectedAccounts.delete(key);
    this.preferences.delete(key);
    this.corrections.delete(key);

    // Delete consents
    for (const [id, consent] of this.consents.entries()) {
      if (consent.tenantId === tenantId && consent.userId === userId) {
        this.consents.delete(id);
        counts.consents++;
      }
    }

    return counts;
  }
}
