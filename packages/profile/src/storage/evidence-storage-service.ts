import crypto from 'node:crypto';
import { v4 as uuidv4 } from 'uuid';
import {
  DEFAULT_STORAGE_CONFIG,
  type DeleteEvidenceRequest,
  type EvidenceFile,
  EvidenceFileSchema,
  EvidenceNotFoundError,
  FileAccessDeniedError,
  FileSizeExceededError,
  type GetSignedUrlResponse,
  InvalidFileTypeError,
  type ListEvidenceRequest,
  type ListEvidenceResponse,
  SignedUrlExpiredError,
  type StorageConfig,
  type UploadEvidenceRequest,
  type UploadEvidenceResponse,
  type VerifyEvidenceRequest,
} from './types.js';

// ============================================================================
// Evidence Storage Service
// ============================================================================

/**
 * Service for managing evidence file storage with access control
 */
export class EvidenceStorageService {
  private config: StorageConfig;
  private secretKey: string;
  private filesStore: Map<string, EvidenceFile> = new Map();
  private fileContentStore: Map<string, Buffer> = new Map(); // For memory provider

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
    // A hardcoded fallback would make every signature forgeable. Without an
    // explicit secret, generate a per-process key: signed URLs then stop
    // working across restarts/instances, which is the safe failure mode.
    this.secretKey =
      this.config.secretKey ||
      process.env.STORAGE_SECRET_KEY ||
      crypto.randomBytes(32).toString('hex');
  }

  /**
   * Upload evidence file
   */
  async uploadEvidence(request: UploadEvidenceRequest): Promise<UploadEvidenceResponse> {
    const {
      userId,
      tenantId,
      file,
      fileName,
      mimeType,
      category,
      description,
      isPublic,
      accessControl,
    } = request;

    // Validate file size
    if (file.length > this.config.maxFileSize) {
      throw new FileSizeExceededError(file.length, this.config.maxFileSize);
    }

    // Validate file type
    if (!this.config.allowedMimeTypes.includes(mimeType)) {
      throw new InvalidFileTypeError(mimeType, this.config.allowedMimeTypes);
    }

    // Calculate file hash
    const hash = this.calculateHash(file);

    // Generate storage key
    const storageKey = this.generateStorageKey(userId, tenantId, fileName, hash);

    const now = new Date().toISOString();
    const fileId = uuidv4();

    // Store file content (for memory provider)
    if (this.config.provider === 'memory') {
      this.fileContentStore.set(fileId, file);
    }

    // Create evidence file record
    const evidenceFile: EvidenceFile = {
      id: fileId,
      userId,
      tenantId,
      fileName,
      originalFileName: fileName,
      mimeType,
      fileSize: file.length,
      hash,
      storageProvider: this.config.provider,
      storageKey,
      storageBucket: this.config.s3?.bucket,
      category,
      description,
      isPublic: isPublic || false,
      accessControl,
      verified: false,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
      deleted: false,
    };

    // Validate and store
    const validatedFile = EvidenceFileSchema.parse(evidenceFile);
    this.filesStore.set(fileId, validatedFile);

    // Generate signed URL
    const signedUrl = await this.generateSignedUrl(fileId, userId, tenantId);

    // Generate download URL
    const downloadUrl = this.generateDownloadUrl(fileId);

    // Update file with URLs
    validatedFile.downloadUrl = downloadUrl;
    validatedFile.signedUrl = signedUrl.signedUrl;
    validatedFile.signedUrlExpiresAt = signedUrl.expiresAt;

    return {
      file: validatedFile,
      downloadUrl,
      signedUrl: signedUrl.signedUrl,
      signedUrlExpiresAt: signedUrl.expiresAt,
    };
  }

  /**
   * Get evidence file by ID
   */
  async getEvidenceFile(fileId: string, userId: string, tenantId: string): Promise<EvidenceFile> {
    const file = this.filesStore.get(fileId);

    if (!file || file.deleted) {
      throw new EvidenceNotFoundError(fileId);
    }

    // Check access
    this.checkAccess(file, userId, tenantId, 'read');

    return file;
  }

  /**
   * Get file content
   */
  async getFileContent(fileId: string, userId: string, tenantId: string): Promise<Buffer> {
    const _file = await this.getEvidenceFile(fileId, userId, tenantId);

    if (this.config.provider === 'memory') {
      const content = this.fileContentStore.get(fileId);
      if (!content) {
        throw new EvidenceNotFoundError(fileId);
      }
      return content;
    }

    // For S3 or local, would fetch from storage
    // This is a placeholder implementation
    throw new Error(`File content retrieval not implemented for provider: ${this.config.provider}`);
  }

  /**
   * Generate signed URL for file access
   */
  async generateSignedUrl(
    fileId: string,
    userId: string,
    tenantId: string,
    expiresIn?: number
  ): Promise<GetSignedUrlResponse> {
    const _file = await this.getEvidenceFile(fileId, userId, tenantId);

    const expirationSeconds = expiresIn || this.config.signedUrlExpiration;
    const expiresAt = new Date(Date.now() + expirationSeconds * 1000).toISOString();

    // Generate signed URL (simplified implementation)
    const signature = this.generateSignature(fileId, expiresAt);
    const signedUrl = `${this.getBaseUrl()}/files/${fileId}/download?signature=${signature}&expires=${expiresAt}`;

    return {
      signedUrl,
      expiresAt,
    };
  }

  /**
   * Validate signed URL
   */
  async validateSignedUrl(fileId: string, signature: string, expiresAt: string): Promise<boolean> {
    // Check expiration and validate date string
    const expiresDate = new Date(expiresAt);
    if (Number.isNaN(expiresDate.getTime()) || expiresDate < new Date()) {
      throw new SignedUrlExpiredError(fileId);
    }

    // Verify signature using constant-time comparison to prevent timing attacks
    const expectedSignature = this.generateSignature(fileId, expiresAt);
    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');

    if (sigBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  }

  /**
   * List evidence files for a user
   */
  async listEvidence(request: ListEvidenceRequest): Promise<ListEvidenceResponse> {
    const { userId, tenantId, category, verified, page = 1, pageSize = 20 } = request;

    let files = Array.from(this.filesStore.values()).filter(
      (file) =>
        file.userId === userId &&
        file.tenantId === tenantId &&
        !file.deleted &&
        this.hasAccess(file, userId, 'read')
    );

    // Apply filters
    if (category) {
      files = files.filter((file) => file.category === category);
    }

    if (verified !== undefined) {
      files = files.filter((file) => file.verified === verified);
    }

    // Sort by createdAt (newest first)
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate
    const total = files.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedFiles = files.slice(startIndex, endIndex);

    return {
      files: paginatedFiles,
      total,
      page,
      pageSize,
      hasMore: endIndex < total,
    };
  }

  /**
   * Verify evidence file
   */
  async verifyEvidence(request: VerifyEvidenceRequest): Promise<EvidenceFile> {
    const { fileId, userId, tenantId, verified, verificationNotes } = request;

    const file = await this.getEvidenceFile(fileId, userId, tenantId);

    // Check write access
    this.checkAccess(file, userId, tenantId, 'write');

    const now = new Date().toISOString();
    const updatedFile: EvidenceFile = {
      ...file,
      verified,
      verifiedAt: verified ? now : undefined,
      verifiedBy: verified ? userId : undefined,
      verificationNotes,
      updatedAt: now,
      updatedBy: userId,
    };

    const validatedFile = EvidenceFileSchema.parse(updatedFile);
    this.filesStore.set(fileId, validatedFile);

    return validatedFile;
  }

  /**
   * Delete evidence file
   */
  async deleteEvidence(request: DeleteEvidenceRequest): Promise<void> {
    const { fileId, userId, tenantId, permanent = false } = request;

    const file = await this.getEvidenceFile(fileId, userId, tenantId);

    // Check write access
    this.checkAccess(file, userId, tenantId, 'write');

    if (permanent) {
      // Permanent delete
      this.filesStore.delete(fileId);
      this.fileContentStore.delete(fileId);
    } else {
      // Soft delete
      const now = new Date().toISOString();
      const deletedFile: EvidenceFile = {
        ...file,
        deleted: true,
        deletedAt: now,
        updatedAt: now,
        updatedBy: userId,
      };

      this.filesStore.set(fileId, deletedFile);
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    fileId: string,
    userId: string,
    tenantId: string,
    updates: {
      description?: string;
      category?: EvidenceFile['category'];
      isPublic?: boolean;
      accessControl?: EvidenceFile['accessControl'];
    }
  ): Promise<EvidenceFile> {
    const file = await this.getEvidenceFile(fileId, userId, tenantId);

    // Check write access
    this.checkAccess(file, userId, tenantId, 'write');

    const now = new Date().toISOString();
    const updatedFile: EvidenceFile = {
      ...file,
      description: updates.description ?? file.description,
      category: updates.category ?? file.category,
      isPublic: updates.isPublic ?? file.isPublic,
      accessControl: updates.accessControl ?? file.accessControl,
      updatedAt: now,
      updatedBy: userId,
    };

    const validatedFile = EvidenceFileSchema.parse(updatedFile);
    this.filesStore.set(fileId, validatedFile);

    return validatedFile;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(
    userId: string,
    tenantId: string
  ): Promise<{
    totalFiles: number;
    totalSize: number;
    byCategory: Record<string, number>;
    verifiedFiles: number;
    unverifiedFiles: number;
  }> {
    const files = Array.from(this.filesStore.values()).filter(
      (file) => file.userId === userId && file.tenantId === tenantId && !file.deleted
    );

    const byCategory: Record<string, number> = {};
    let totalSize = 0;
    let verifiedFiles = 0;
    let unverifiedFiles = 0;

    for (const file of files) {
      byCategory[file.category] = (byCategory[file.category] || 0) + 1;
      totalSize += file.fileSize;

      if (file.verified) {
        verifiedFiles++;
      } else {
        unverifiedFiles++;
      }
    }

    return {
      totalFiles: files.length,
      totalSize,
      byCategory,
      verifiedFiles,
      unverifiedFiles,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Calculate SHA-256 hash of file content
   */
  private calculateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Generate storage key for file
   */
  private generateStorageKey(
    userId: string,
    tenantId: string,
    fileName: string,
    hash: string
  ): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${tenantId}/${userId}/${timestamp}-${hash.substring(0, 8)}-${sanitizedFileName}`;
  }

  /**
   * Generate signature for signed URL using HMAC-SHA256
   */
  private generateSignature(fileId: string, expiresAt: string): string {
    const data = `${fileId}:${expiresAt}`;
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }

  /**
   * Generate download URL
   */
  private generateDownloadUrl(fileId: string): string {
    return `${this.getBaseUrl()}/files/${fileId}/download`;
  }

  /**
   * Get base URL for file access
   */
  private getBaseUrl(): string {
    if (this.config.provider === 's3' && this.config.s3) {
      return `https://${this.config.s3.bucket}.s3.${this.config.s3.region}.amazonaws.com`;
    }
    return 'https://api.nextjob.ai';
  }

  /**
   * Check if user has access to file
   */
  private hasAccess(file: EvidenceFile, userId: string, permission: 'read' | 'write'): boolean {
    // Public files are readable by everyone
    if (file.isPublic && permission === 'read') {
      return true;
    }

    // Owner always has access
    if (file.userId === userId) {
      return true;
    }

    // Check access control
    if (file.accessControl) {
      const allowedUsers =
        permission === 'read' ? file.accessControl.read : file.accessControl.write;
      if (allowedUsers?.includes(userId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check access and throw error if denied
   */
  private checkAccess(
    file: EvidenceFile,
    userId: string,
    tenantId: string,
    permission: 'read' | 'write'
  ): void {
    // Check tenant isolation
    if (file.tenantId !== tenantId) {
      throw new FileAccessDeniedError(file.id, userId);
    }

    // Check access
    if (!this.hasAccess(file, userId, permission)) {
      throw new FileAccessDeniedError(file.id, userId);
    }
  }
}

// Export singleton instance
export const evidenceStorageService = new EvidenceStorageService();
