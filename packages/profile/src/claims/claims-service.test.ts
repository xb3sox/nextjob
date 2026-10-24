import { beforeEach, describe, expect, it } from 'vitest';
import { ClaimsService } from './claims-service.js';
import { ClaimNotFoundError, InvalidClaimContentError } from './types.js';

describe('ClaimsService', () => {
  let service: ClaimsService;

  beforeEach(() => {
    service = new ClaimsService();
  });

  describe('createClaim', () => {
    it('should create a new experience claim', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'experience' as const,
        title: 'Software Engineer at Tech Corp',
        content: {
          company: 'Tech Corp',
          position: 'Software Engineer',
          startDate: '2020-01-01T00:00:00Z',
          endDate: '2023-12-31T00:00:00Z',
        },
      };

      const claim = await service.createClaim(request);

      expect(claim.id).toBeDefined();
      expect(claim.userId).toBe(request.userId);
      expect(claim.type).toBe('experience');
      expect(claim.title).toBe(request.title);
      expect(claim.version).toBe(1);
      expect(claim.verificationStatus).toBe('unverified');
    });

    it('should create a skill claim', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'skill' as const,
        title: 'TypeScript',
        content: {
          name: 'TypeScript',
          level: 'expert',
          yearsOfExperience: 5,
        },
      };

      const claim = await service.createClaim(request);

      expect(claim.type).toBe('skill');
      expect(claim.content.name).toBe('TypeScript');
    });

    it('should throw error for invalid content', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'experience' as const,
        title: 'Invalid Experience',
        content: {}, // Missing required fields
      };

      await expect(service.createClaim(request)).rejects.toThrow(InvalidClaimContentError);
    });
  });

  describe('getClaim', () => {
    it('should retrieve a claim by ID', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'skill' as const,
        title: 'React',
        content: { name: 'React', level: 'advanced' },
      };

      const created = await service.createClaim(request);
      const retrieved = await service.getClaim(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.title).toBe('React');
    });

    it('should throw error for non-existent claim', async () => {
      await expect(service.getClaim('non-existent-id')).rejects.toThrow(ClaimNotFoundError);
    });
  });

  describe('updateClaim', () => {
    it('should update a claim and create new version', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'skill' as const,
        title: 'JavaScript',
        content: { name: 'JavaScript', level: 'intermediate' },
      };

      const created = await service.createClaim(request);
      const updated = await service.updateClaim(
        created.id,
        { content: { name: 'JavaScript', level: 'expert' } },
        'user-123'
      );

      expect(updated.version).toBe(2);
      expect(updated.previousVersionId).toBe(created.id);
      expect(updated.content.level).toBe('expert');
    });
  });

  describe('verifyClaim', () => {
    it('should verify a claim', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'education' as const,
        title: 'BSc Computer Science',
        content: {
          institution: 'MIT',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
        },
      };

      const created = await service.createClaim(request);
      const verified = await service.verifyClaim(created.id, {
        verificationStatus: 'verified',
        verifiedBy: 'admin-789',
        verificationNotes: 'Verified with transcript',
      });

      expect(verified.verificationStatus).toBe('verified');
      expect(verified.verifiedAt).toBeDefined();
      expect(verified.verifiedBy).toBe('admin-789');
    });
  });

  describe('listClaims', () => {
    it('should list claims for a user', async () => {
      // Create multiple claims
      await service.createClaim({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'skill',
        title: 'JavaScript',
        content: { name: 'JavaScript' },
      });

      await service.createClaim({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'skill',
        title: 'TypeScript',
        content: { name: 'TypeScript' },
      });

      const result = await service.listClaims('user-123', 'tenant-456');

      expect(result.claims).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by type', async () => {
      await service.createClaim({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'skill',
        title: 'JavaScript',
        content: { name: 'JavaScript' },
      });

      await service.createClaim({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'education',
        title: 'BSc',
        content: { institution: 'MIT', degree: 'BSc' },
      });

      const result = await service.listClaims('user-123', 'tenant-456', { type: 'skill' });

      expect(result.claims).toHaveLength(1);
      expect(result.claims[0].type).toBe('skill');
    });
  });

  describe('calculateProfileConfidence', () => {
    it('should calculate confidence score', async () => {
      // Create claims with evidence
      await service.createClaim({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'skill',
        title: 'JavaScript',
        content: { name: 'JavaScript' },
        evidenceId: 'evidence-1',
      });

      await service.createClaim({
        userId: 'user-123',
        tenantId: 'tenant-456',
        type: 'skill',
        title: 'TypeScript',
        content: { name: 'TypeScript' },
        evidenceId: 'evidence-2',
      });

      const confidence = await service.calculateProfileConfidence('user-123', 'tenant-456');

      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });
  });
});
