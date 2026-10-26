import { beforeEach, describe, expect, it } from 'vitest';
import { EvidenceStorageService } from './evidence-storage-service.js';
import {
  EvidenceNotFoundError,
  FileAccessDeniedError,
  FileSizeExceededError,
  InvalidFileTypeError,
  SignedUrlExpiredError,
} from './types.js';

describe('EvidenceStorageService', () => {
  let service: EvidenceStorageService;

  beforeEach(() => {
    service = new EvidenceStorageService({
      provider: 'memory',
      maxFileSize: 10 * 1024 * 1024, // 10 MB
      allowedMimeTypes: ['application/pdf', 'image/jpeg'],
    });
  });

  describe('uploadEvidence', () => {
    it('should upload evidence file successfully', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test file content'),
        fileName: 'resume.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
        description: 'My resume',
      };

      const result = await service.uploadEvidence(request);

      expect(result.file.id).toBeDefined();
      expect(result.file.userId).toBe('user-123');
      expect(result.file.fileName).toBe('resume.pdf');
      expect(result.file.mimeType).toBe('application/pdf');
      expect(result.file.category).toBe('resume');
      expect(result.file.hash).toBeDefined();
      expect(result.file.storageProvider).toBe('memory');
      expect(result.signedUrl).toBeDefined();
      expect(result.downloadUrl).toBeDefined();
    });

    it('should throw error if file size exceeds limit', async () => {
      const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11 MB

      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: largeFile,
        fileName: 'large.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      };

      await expect(service.uploadEvidence(request)).rejects.toThrow(FileSizeExceededError);
    });

    it('should throw error if file type is not allowed', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'file.txt',
        mimeType: 'text/plain',
        category: 'other' as const,
      };

      await expect(service.uploadEvidence(request)).rejects.toThrow(InvalidFileTypeError);
    });

    it('should set access control if provided', async () => {
      const request = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'shared.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
        accessControl: {
          read: ['user-456', 'user-789'],
          write: ['user-456'],
        },
      };

      const result = await service.uploadEvidence(request);

      expect(result.file.accessControl?.read).toEqual(['user-456', 'user-789']);
      expect(result.file.accessControl?.write).toEqual(['user-456']);
    });
  });

  describe('getEvidenceFile', () => {
    it('should retrieve evidence file by ID', async () => {
      const uploadRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      };

      const uploaded = await service.uploadEvidence(uploadRequest);
      const retrieved = await service.getEvidenceFile(uploaded.file.id, 'user-123', 'tenant-456');

      expect(retrieved.id).toBe(uploaded.file.id);
      expect(retrieved.fileName).toBe('test.pdf');
    });

    it('should throw error if file not found', async () => {
      await expect(
        service.getEvidenceFile('non-existent-id', 'user-123', 'tenant-456')
      ).rejects.toThrow(EvidenceNotFoundError);
    });

    it('should throw error if user does not have access', async () => {
      const uploadRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      };

      const uploaded = await service.uploadEvidence(uploadRequest);

      await expect(
        service.getEvidenceFile(uploaded.file.id, 'different-user', 'tenant-456')
      ).rejects.toThrow(FileAccessDeniedError);
    });

    it('should allow access if user is in read access control', async () => {
      const uploadRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
        accessControl: {
          read: ['user-456'],
        },
      };

      const uploaded = await service.uploadEvidence(uploadRequest);
      const retrieved = await service.getEvidenceFile(uploaded.file.id, 'user-456', 'tenant-456');

      expect(retrieved.id).toBe(uploaded.file.id);
    });

    it('should allow access to public files', async () => {
      const uploadRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'public.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
        isPublic: true,
      };

      const uploaded = await service.uploadEvidence(uploadRequest);
      const retrieved = await service.getEvidenceFile(uploaded.file.id, 'any-user', 'tenant-456');

      expect(retrieved.id).toBe(uploaded.file.id);
    });
  });

  describe('getFileContent', () => {
    it('should retrieve file content', async () => {
      const content = Buffer.from('test file content');
      const uploadRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: content,
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      };

      const uploaded = await service.uploadEvidence(uploadRequest);
      const retrieved = await service.getFileContent(uploaded.file.id, 'user-123', 'tenant-456');

      expect(retrieved.toString()).toBe('test file content');
    });
  });

  describe('generateSignedUrl', () => {
    it('should generate signed URL', async () => {
      const uploadRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      };

      const uploaded = await service.uploadEvidence(uploadRequest);
      const signedUrl = await service.generateSignedUrl(
        uploaded.file.id,
        'user-123',
        'tenant-456',
        3600
      );

      expect(signedUrl.signedUrl).toBeDefined();
      expect(signedUrl.expiresAt).toBeDefined();
    });
  });

  describe('validateSignedUrl', () => {
    it('should validate valid signed URL', async () => {
      const uploadRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      };

      const uploaded = await service.uploadEvidence(uploadRequest);
      const signedUrl = await service.generateSignedUrl(
        uploaded.file.id,
        'user-123',
        'tenant-456',
        3600
      );

      // Extract signature and expires from URL
      const url = new URL(signedUrl.signedUrl);
      const signature = url.searchParams.get('signature')!;
      const expires = url.searchParams.get('expires')!;

      const isValid = await service.validateSignedUrl(uploaded.file.id, signature, expires);
      expect(isValid).toBe(true);
    });

    it('should reject forged signed URL created without HMAC secret', async () => {
      const uploadRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      };

      const uploaded = await service.uploadEvidence(uploadRequest);
      const expires = new Date(Date.now() + 3600 * 1000).toISOString();

      // Attempt unkeyed SHA-256 forgery
      const crypto = await import('crypto');
      const forgedSig = crypto
        .createHash('sha256')
        .update(`${uploaded.file.id}:${expires}`)
        .digest('hex');

      const isValid = await service.validateSignedUrl(uploaded.file.id, forgedSig, expires);
      expect(isValid).toBe(false);
    });

    it('should reject invalid or tampered signature', async () => {
      const uploadRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      };

      const uploaded = await service.uploadEvidence(uploadRequest);
      const signedUrl = await service.generateSignedUrl(
        uploaded.file.id,
        'user-123',
        'tenant-456',
        3600
      );

      const url = new URL(signedUrl.signedUrl);
      const signature = url.searchParams.get('signature')!;
      const expires = url.searchParams.get('expires')!;

      // Flip the first hex char so the tampered signature always differs, even
      // when the real signature happens to end in the characters we replace.
      const tamperedSig = `${signature[0] === '0' ? '1' : '0'}${signature.slice(1)}`;
      const isValid = await service.validateSignedUrl(uploaded.file.id, tamperedSig, expires);
      expect(isValid).toBe(false);
    });

    it('should throw SignedUrlExpiredError for expired signed URL', async () => {
      const uploadRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      };

      const uploaded = await service.uploadEvidence(uploadRequest);
      const pastDate = new Date(Date.now() - 10000).toISOString();

      await expect(
        service.validateSignedUrl(uploaded.file.id, 'dummy-signature', pastDate)
      ).rejects.toThrow(SignedUrlExpiredError);
    });

    it('should throw SignedUrlExpiredError for malformed or invalid expires date string', async () => {
      const uploadRequest = {
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      };

      const uploaded = await service.uploadEvidence(uploadRequest);

      await expect(
        service.validateSignedUrl(uploaded.file.id, 'dummy-signature', 'invalid-date')
      ).rejects.toThrow(SignedUrlExpiredError);
    });
  });

  describe('listEvidence', () => {
    it('should list evidence files for user', async () => {
      // Upload multiple files
      await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test1'),
        fileName: 'file1.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      });

      await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test2'),
        fileName: 'file2.pdf',
        mimeType: 'application/pdf',
        category: 'certificate' as const,
      });

      const result = await service.listEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
      });

      expect(result.files).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by category', async () => {
      await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test1'),
        fileName: 'resume.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      });

      await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test2'),
        fileName: 'cert.pdf',
        mimeType: 'application/pdf',
        category: 'certificate' as const,
      });

      const result = await service.listEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        category: 'resume',
      });

      expect(result.files).toHaveLength(1);
      expect(result.files[0].category).toBe('resume');
    });

    it('should filter by verification status', async () => {
      const uploaded = await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      });

      await service.verifyEvidence({
        fileId: uploaded.file.id,
        userId: 'user-123',
        tenantId: 'tenant-456',
        verified: true,
      });

      const result = await service.listEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        verified: true,
      });

      expect(result.files).toHaveLength(1);
      expect(result.files[0].verified).toBe(true);
    });

    it('should paginate results', async () => {
      // Upload 5 files
      for (let i = 0; i < 5; i++) {
        await service.uploadEvidence({
          userId: 'user-123',
          tenantId: 'tenant-456',
          file: Buffer.from(`test${i}`),
          fileName: `file${i}.pdf`,
          mimeType: 'application/pdf',
          category: 'resume' as const,
        });
      }

      const result = await service.listEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        page: 1,
        pageSize: 2,
      });

      expect(result.files).toHaveLength(2);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(true);
    });
  });

  describe('verifyEvidence', () => {
    it('should verify evidence file', async () => {
      const uploaded = await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      });

      const verified = await service.verifyEvidence({
        fileId: uploaded.file.id,
        userId: 'user-123',
        tenantId: 'tenant-456',
        verified: true,
        verificationNotes: 'Verified by admin',
      });

      expect(verified.verified).toBe(true);
      expect(verified.verifiedAt).toBeDefined();
      expect(verified.verifiedBy).toBe('user-123');
      expect(verified.verificationNotes).toBe('Verified by admin');
    });

    it('should unverify evidence file', async () => {
      const uploaded = await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      });

      await service.verifyEvidence({
        fileId: uploaded.file.id,
        userId: 'user-123',
        tenantId: 'tenant-456',
        verified: true,
      });

      const unverified = await service.verifyEvidence({
        fileId: uploaded.file.id,
        userId: 'user-123',
        tenantId: 'tenant-456',
        verified: false,
      });

      expect(unverified.verified).toBe(false);
    });
  });

  describe('deleteEvidence', () => {
    it('should soft delete evidence file', async () => {
      const uploaded = await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      });

      await service.deleteEvidence({
        fileId: uploaded.file.id,
        userId: 'user-123',
        tenantId: 'tenant-456',
      });

      await expect(
        service.getEvidenceFile(uploaded.file.id, 'user-123', 'tenant-456')
      ).rejects.toThrow(EvidenceNotFoundError);
    });

    it('should permanently delete evidence file', async () => {
      const uploaded = await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      });

      await service.deleteEvidence({
        fileId: uploaded.file.id,
        userId: 'user-123',
        tenantId: 'tenant-456',
        permanent: true,
      });

      await expect(
        service.getEvidenceFile(uploaded.file.id, 'user-123', 'tenant-456')
      ).rejects.toThrow(EvidenceNotFoundError);
    });
  });

  describe('updateFileMetadata', () => {
    it('should update file metadata', async () => {
      const uploaded = await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test'),
        fileName: 'test.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      });

      const updated = await service.updateFileMetadata(uploaded.file.id, 'user-123', 'tenant-456', {
        description: 'Updated description',
        category: 'certificate',
      });

      expect(updated.description).toBe('Updated description');
      expect(updated.category).toBe('certificate');
    });
  });

  describe('getStorageStats', () => {
    it('should return storage statistics', async () => {
      await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test1'),
        fileName: 'resume.pdf',
        mimeType: 'application/pdf',
        category: 'resume' as const,
      });

      await service.uploadEvidence({
        userId: 'user-123',
        tenantId: 'tenant-456',
        file: Buffer.from('test2'),
        fileName: 'cert.pdf',
        mimeType: 'application/pdf',
        category: 'certificate' as const,
      });

      const stats = await service.getStorageStats('user-123', 'tenant-456');

      expect(stats.totalFiles).toBe(2);
      expect(stats.totalSize).toBeGreaterThan(0);
      expect(stats.byCategory.resume).toBe(1);
      expect(stats.byCategory.certificate).toBe(1);
      expect(stats.verifiedFiles).toBe(0);
      expect(stats.unverifiedFiles).toBe(2);
    });
  });
});
