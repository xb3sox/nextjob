import crypto from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { PrivacyService } from './privacy-service';
import type { PrivacyStore } from './privacy-store';

describe('Privacy Controls Service (T-36, FR-10, PRD §Privacy Requirements)', () => {
  let service: PrivacyService;
  let store: PrivacyStore;
  const TENANT_ID = 'tenant_123';
  const USER_ID = 'usr_abc_789';

  beforeEach(() => {
    service = new PrivacyService();
    store = service.store;

    // Seed mock candidate data
    store.seedUserData(TENANT_ID, USER_ID, {
      profile: {
        id: USER_ID,
        fullName: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '+1-555-0199',
      },
      claims: [
        { id: 'claim_1', type: 'experience', role: 'Staff Engineer', verified: true },
        { id: 'claim_2', type: 'education', degree: 'B.S. Computer Science', verified: true },
      ],
      evidence: [{ id: 'ev_1', fileName: 'resume_2026.pdf', s3Key: 'tenants/123/ev_1' }],
      applications: [{ id: 'app_1', jobId: 'job_456', status: 'SUBMITTED_VERIFIED' }],
      receipts: [{ id: 'rcpt_1', applicationId: 'app_1', receiptHash: 'abc123sha' }],
      tokens: [{ id: 'tok_1', provider: 'greenhouse', token: 'secret_token_val' }],
    });
  });

  describe('1. View Data (FR-10)', () => {
    it('returns complete candidate data across all domains', async () => {
      const data = await service.viewData(TENANT_ID, USER_ID);

      expect(data.userId).toBe(USER_ID);
      expect(data.tenantId).toBe(TENANT_ID);
      expect(data.profile.fullName).toBe('Jane Doe');
      expect(data.claims).toHaveLength(2);
      expect(data.evidence).toHaveLength(1);
      expect(data.applications).toHaveLength(1);
      expect(data.receipts).toHaveLength(1);
      expect(data.preferences).toBeDefined();
    });
  });

  describe('2. Correct Data (FR-10)', () => {
    it('records data correction with previous and new values and audit timestamp', async () => {
      const correction = await service.correctData(
        TENANT_ID,
        USER_ID,
        'profile.phone',
        '+1-555-9999',
        '+1-555-0199',
        'Updated mobile phone number'
      );

      expect(correction.id).toMatch(/^corr_/);
      expect(correction.field).toBe('profile.phone');
      expect(correction.previousValue).toBe('+1-555-0199');
      expect(correction.newValue).toBe('+1-555-9999');
      expect(correction.reason).toBe('Updated mobile phone number');
      expect(correction.timestamp).toBeInstanceOf(Date);

      const allCorrections = await store.getCorrections(TENANT_ID, USER_ID);
      expect(allCorrections).toHaveLength(1);
      expect(allCorrections[0].id).toBe(correction.id);
    });
  });

  describe('3. Export Data (FR-10)', () => {
    it('generates structured machine-readable export with SHA-256 checksum', async () => {
      const exportArchive = await service.exportData(TENANT_ID, USER_ID);

      expect(exportArchive.formatVersion).toBe('1.0.0');
      expect(exportArchive.userId).toBe(USER_ID);
      expect(exportArchive.tenantId).toBe(TENANT_ID);
      expect(exportArchive.candidateData.profile.fullName).toBe('Jane Doe');
      expect(exportArchive.candidateData.claims).toHaveLength(2);

      // Verify SHA-256 checksum validity
      expect(exportArchive.sha256Checksum).toMatch(/^[a-f0-9]{64}$/);

      const expectedPayload = JSON.stringify({
        formatVersion: '1.0.0',
        exportedAt: exportArchive.exportedAt,
        tenantId: TENANT_ID,
        userId: USER_ID,
        candidateData: exportArchive.candidateData,
      });
      const expectedHash = crypto.createHash('sha256').update(expectedPayload).digest('hex');
      expect(exportArchive.sha256Checksum).toBe(expectedHash);
    });
  });

  describe('4. Delete Data & Cascading Purge (FR-10)', () => {
    it('executes cascading hard deletion across all domains and outputs deletion receipt', async () => {
      const receipt = await service.deleteData(TENANT_ID, USER_ID);

      expect(receipt.status).toBe('completed');
      expect(receipt.deletionId).toMatch(/^del_/);
      expect(receipt.userId).toBe(USER_ID);
      expect(receipt.recordsDeleted).toEqual({
        profile: 1,
        claims: 2,
        evidence: 1,
        applications: 1,
        receipts: 1,
        tokens: 1,
        consents: 0,
      });
      expect(receipt.verificationHash).toMatch(/^[a-f0-9]{64}$/);

      // Verify post-deletion state has zero domain records remaining
      const afterData = await service.viewData(TENANT_ID, USER_ID);
      expect(afterData.claims).toHaveLength(0);
      expect(afterData.evidence).toHaveLength(0);
      expect(afterData.applications).toHaveLength(0);
      expect(afterData.receipts).toHaveLength(0);
      expect(afterData.connectedAccounts).toHaveLength(0);
    });
  });

  describe('5. Consent Management & Purpose Limitation (FR-10, PRD)', () => {
    it('tracks consent with policy versioning and timestamps', async () => {
      const consent = await service.consentManager.grantConsent(
        TENANT_ID,
        USER_ID,
        'application_submission',
        { policyVersion: '2026.2', retentionDays: 180, ipAddress: '192.168.1.1' }
      );

      expect(consent.id).toMatch(/^consent_/);
      expect(consent.purpose).toBe('application_submission');
      expect(consent.status).toBe('granted');
      expect(consent.policyVersion).toBe('2026.2');
      expect(consent.retentionDays).toBe(180);
      expect(consent.ipAddress).toBe('192.168.1.1');
    });

    it('enforces purpose limitation: blocks processing when consent is missing or revoked', async () => {
      // 1. Without consent -> blocked
      const check1 = await service.consentManager.canProcessForPurpose(
        TENANT_ID,
        USER_ID,
        'application_submission'
      );
      expect(check1.allowed).toBe(false);
      expect(check1.reason).toContain('Missing valid, unexpired consent');

      // 2. Grant consent -> allowed
      await service.consentManager.grantConsent(TENANT_ID, USER_ID, 'application_submission');
      const check2 = await service.consentManager.canProcessForPurpose(
        TENANT_ID,
        USER_ID,
        'application_submission'
      );
      expect(check2.allowed).toBe(true);

      // 3. Revoke consent -> blocked again
      await service.consentManager.revokeConsent(TENANT_ID, USER_ID, 'application_submission');
      const check3 = await service.consentManager.canProcessForPurpose(
        TENANT_ID,
        USER_ID,
        'application_submission'
      );
      expect(check3.allowed).toBe(false);
    });

    it('supports revoking all active consents in bulk', async () => {
      await service.consentManager.grantConsent(TENANT_ID, USER_ID, 'job_discovery');
      await service.consentManager.grantConsent(TENANT_ID, USER_ID, 'tailoring');
      await service.consentManager.grantConsent(TENANT_ID, USER_ID, 'application_submission');

      const revoked = await service.consentManager.revokeAllConsents(TENANT_ID, USER_ID);
      expect(revoked).toHaveLength(3);

      const check = await service.consentManager.canProcessForPurpose(
        TENANT_ID,
        USER_ID,
        'job_discovery'
      );
      expect(check.allowed).toBe(false);
    });

    it('expires consent when retention duration has elapsed', async () => {
      const _consent = await service.consentManager.grantConsent(
        TENANT_ID,
        USER_ID,
        'tailoring',
        { retentionDays: -1 } // already expired
      );

      const check = await service.consentManager.canProcessForPurpose(
        TENANT_ID,
        USER_ID,
        'tailoring'
      );
      expect(check.allowed).toBe(false);
    });
  });

  describe('6. Disable AI Model Learning (FR-10 Opt-Out)', () => {
    it('disables model learning and blocks model_training purpose processing', async () => {
      // Initially, model learning is false by default unless granted
      expect(await service.consentManager.isModelLearningEnabled(TENANT_ID, USER_ID)).toBe(false);

      // Grant model learning
      await service.consentManager.setModelLearning(TENANT_ID, USER_ID, true);
      expect(await service.consentManager.isModelLearningEnabled(TENANT_ID, USER_ID)).toBe(true);

      const allowedCheck = await service.consentManager.canProcessForPurpose(
        TENANT_ID,
        USER_ID,
        'model_training'
      );
      expect(allowedCheck.allowed).toBe(true);

      // Explicitly opt out / disable model learning
      await service.updatePreferences(TENANT_ID, USER_ID, { disableModelLearning: true });

      const blockedCheck = await service.consentManager.canProcessForPurpose(
        TENANT_ID,
        USER_ID,
        'model_training'
      );
      expect(blockedCheck.allowed).toBe(false);
      expect(blockedCheck.reason).toContain('explicitly disabled AI model learning');
    });
  });

  describe('7. Disconnect Integrations (FR-10)', () => {
    it('disconnects third-party ATS accounts and revokes access', async () => {
      await store.addConnectedAccount(TENANT_ID, USER_ID, {
        id: 'conn_1',
        provider: 'greenhouse',
        accountId: 'gh_candidate_42',
        connectedAt: new Date(),
        scopes: ['applications:write', 'profile:read'],
      });

      const accountsBefore = await store.getConnectedAccounts(TENANT_ID, USER_ID);
      expect(accountsBefore).toHaveLength(1);

      const disconnectResult = await service.disconnectIntegration(
        TENANT_ID,
        USER_ID,
        'greenhouse'
      );
      expect(disconnectResult.disconnected).toBe(true);
      expect(disconnectResult.provider).toBe('greenhouse');

      const accountsAfter = await store.getConnectedAccounts(TENANT_ID, USER_ID);
      expect(accountsAfter).toHaveLength(0);
    });
  });
});
