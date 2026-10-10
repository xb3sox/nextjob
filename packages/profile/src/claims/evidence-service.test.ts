import { describe, it, expect, beforeEach } from 'vitest';
import { EvidenceService } from './evidence-service.js';
import { EvidenceNotFoundError } from './types.js';

describe('EvidenceService', () => {
  let service: EvidenceService;

  beforeEach(() => {
    service = new EvidenceService();
  });

  describe('createEvidence', () => {
    it('should create new evidence', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'resume' as const,
        name: 'My Resume.pdf',
        storageType: 's3' as const,
        storageKey: 'resumes/user-123/resume.pdf',
        mimeType: 'application/pdf',
        fileSize: 1024000,
        hash: 'abc123def456',
      };

      const evidence = await service.createEvidence(request);

      expect(evidence.id).toBeDefined();
      expect(evidence.userId).toBe(request.userId);
      expect(evidence.type).toBe('resume');
      expect(evidence.name).toBe('My Resume.pdf');
      expect(evidence.verified).toBe(false);
    });

    it('should create text-based evidence', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'verification_link' as const,
        name: 'LinkedIn Profile',
        storageType: 'url' as const,
        storageKey: 'https://linkedin.com/in/johndoe',
      };

      const evidence = await service.createEvidence(request);

      expect(evidence.type).toBe('verification_link');
      expect(evidence.storageType).toBe('url');
    });
  });

  describe('getEvidence', () => {
    it('should retrieve evidence by ID', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'certificate' as const,
        name: 'AWS Certification',
        storageType: 's3' as const,
        storageKey: 'certs/aws-cert.pdf',
      };

      const created = await service.createEvidence(request);
      const retrieved = await service.getEvidence(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('AWS Certification');
    });

    it('should throw error for non-existent evidence', async () => {
      await expect(service.getEvidence('non-existent-id')).rejects.toThrow(EvidenceNotFoundError);
    });
  });

  describe('verifyEvidence', () => {
    it('should verify evidence', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'transcript' as const,
        name: 'University Transcript',
        storageType: 's3' as const,
        storageKey: 'transcripts/transcript.pdf',
      };

      const created = await service.createEvidence(request);
      const verified = await service.verifyEvidence(created.id, 'admin-789');

      expect(verified.verified).toBe(true);
      expect(verified.verifiedAt).toBeDefined();
      expect(verified.verifiedBy).toBe('admin-789');
    });
  });

  describe('listEvidence', () => {
    it('should list evidence for a user', async () => {
      await service.createEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'resume',
        name: 'Resume 1',
        storageType: 's3',
      });

      await service.createEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'certificate',
        name: 'Cert 1',
        storageType: 's3',
      });

      const result = await service.listEvidence('user-123', 'tenant-456');

      expect(result.evidence).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by type', async () => {
      await service.createEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'resume',
        name: 'Resume',
        storageType: 's3',
      });

      await service.createEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'certificate',
        name: 'Certificate',
        storageType: 's3',
      });

      const result = await service.listEvidence('user-123', 'tenant-456', { type: 'resume' });

      expect(result.evidence).toHaveLength(1);
      expect(result.evidence[0].type).toBe('resume');
    });

    it('should filter by verification status', async () => {
      const ev1 = await service.createEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'resume',
        name: 'Resume 1',
        storageType: 's3',
      });

      await service.createEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'resume',
        name: 'Resume 2',
        storageType: 's3',
      });

      await service.verifyEvidence(ev1.id, 'admin-789');

      const result = await service.listEvidence('user-123', 'tenant-456', { verified: true });

      expect(result.evidence).toHaveLength(1);
      expect(result.evidence[0].verified).toBe(true);
    });
  });

  describe('getEvidenceByHash', () => {
    it('should find evidence by hash', async () => {
      const hash = 'unique-hash-123';
      
      await service.createEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'resume',
        name: 'Resume',
        storageType: 's3',
        hash,
      });

      const found = await service.getEvidenceByHash(hash, 'user-123', 'tenant-456');

      expect(found).toBeDefined();
      expect(found?.hash).toBe(hash);
    });

    it('should return null for non-existent hash', async () => {
      const found = await service.getEvidenceByHash('non-existent', 'user-123', 'tenant-456');

      expect(found).toBeNull();
    });
  });

  describe('calculateEvidenceCoverage', () => {
    it('should calculate coverage percentage', async () => {
      const ev1 = await service.createEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'resume',
        name: 'Resume',
        storageType: 's3',
      });

      await service.createEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'certificate',
        name: 'Certificate',
        storageType: 's3',
      });

      await service.verifyEvidence(ev1.id, 'admin-789');

      const coverage = await service.calculateEvidenceCoverage('user-123', 'tenant-456');

      expect(coverage.totalEvidence).toBe(2);
      expect(coverage.verifiedEvidence).toBe(1);
      expect(coverage.coveragePercentage).toBe(50);
    });
  });

  describe('getEvidenceStats', () => {
    it('should return statistics', async () => {
      await service.createEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'resume',
        name: 'Resume',
        storageType: 's3',
        fileSize: 1000000,
      });

      await service.createEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'certificate',
        name: 'Certificate',
        storageType: 's3',
        fileSize: 500000,
      });

      const stats = await service.getEvidenceStats('user-123', 'tenant-456');

      expect(stats.byType.resume).toBe(1);
      expect(stats.byType.certificate).toBe(1);
      expect(stats.byVerificationStatus.unverified).toBe(2);
      expect(stats.totalSize).toBe(1500000);
    });
  });
});
