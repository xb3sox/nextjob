import { z } from 'zod';

// ============================================================================
// Evidence Storage Types
// ============================================================================

export type StorageProvider = 's3' | 'local' | 'memory';

export type EvidenceCategory =
  | 'resume'
  | 'certificate'
  | 'transcript'
  | 'portfolio'
  | 'reference'
  | 'verification_link'
  | 'other';

// ============================================================================
// Evidence File Schema
// ============================================================================

export const EvidenceFileSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  tenantId: z.string().min(1),

  // File metadata
  fileName: z.string().min(1),
  originalFileName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.number().positive(),
  hash: z.string().min(1), // SHA-256 hash

  // Storage location
  storageProvider: z.enum(['s3', 'local', 'memory']),
  storageKey: z.string().min(1),
  storageBucket: z.string().optional(),

  // Category and description
  category: z.enum([
    'resume',
    'certificate',
    'transcript',
    'portfolio',
    'reference',
    'verification_link',
    'other',
  ]),
  description: z.string().optional(),

  // Access control
  isPublic: z.boolean().default(false),
  accessControl: z
    .object({
      read: z.array(z.string().min(1)).optional(), // User IDs with read access
      write: z.array(z.string().min(1)).optional(), // User IDs with write access
    })
    .optional(),

  // Verification
  verified: z.boolean().default(false),
  verifiedAt: z.string().datetime().optional(),
  verifiedBy: z.string().min(1).optional(),
  verificationNotes: z.string().optional(),

  // URLs
  downloadUrl: z.string().url().optional(),
  signedUrl: z.string().url().optional(),
  signedUrlExpiresAt: z.string().datetime().optional(),

  // Metadata
  version: z.number().int().positive().default(1),
  previousVersionId: z.string().min(1).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),

  // Soft delete
  deleted: z.boolean().default(false),
  deletedAt: z.string().datetime().optional(),
});

export type EvidenceFile = z.infer<typeof EvidenceFileSchema>;

// ============================================================================
// Request/Response Types
// ============================================================================

export interface UploadEvidenceRequest {
  userId: string;
  tenantId: string;
  file: Buffer;
  fileName: string;
  mimeType: string;
  category: EvidenceCategory;
  description?: string;
  isPublic?: boolean;
  accessControl?: {
    read?: string[];
    write?: string[];
  };
}

export interface UploadEvidenceResponse {
  file: EvidenceFile;
  downloadUrl: string;
  signedUrl: string;
  signedUrlExpiresAt: string;
}

export interface GetSignedUrlRequest {
  fileId: string;
  userId: string;
  tenantId: string;
  expiresIn?: number; // seconds
}

export interface GetSignedUrlResponse {
  signedUrl: string;
  expiresAt: string;
}

export interface ListEvidenceRequest {
  userId: string;
  tenantId: string;
  category?: EvidenceCategory;
  verified?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ListEvidenceResponse {
  files: EvidenceFile[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface VerifyEvidenceRequest {
  fileId: string;
  userId: string;
  tenantId: string;
  verified: boolean;
  verificationNotes?: string;
}

export interface DeleteEvidenceRequest {
  fileId: string;
  userId: string;
  tenantId: string;
  permanent?: boolean;
}

// ============================================================================
// Storage Configuration
// ============================================================================

export interface StorageConfig {
  provider: StorageProvider;
  secretKey?: string;

  // S3 configuration
  s3?: {
    bucket: string;
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint?: string;
  };

  // Local storage configuration
  local?: {
    basePath: string;
  };

  // Signed URL configuration
  signedUrlExpiration: number; // seconds
  maxFileSize: number; // bytes
  allowedMimeTypes: string[];
}

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  provider: 'memory',
  signedUrlExpiration: 3600, // 1 hour
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
  ],
};

// ============================================================================
// Error Types
// ============================================================================

export class EvidenceStorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'EvidenceStorageError';
  }
}

export class EvidenceNotFoundError extends EvidenceStorageError {
  constructor(fileId: string) {
    super(`Evidence file not found: ${fileId}`, 'EVIDENCE_NOT_FOUND', 404);
    this.name = 'EvidenceNotFoundError';
  }
}

export class FileAccessDeniedError extends EvidenceStorageError {
  constructor(fileId: string, userId: string) {
    super(`Access denied to evidence file ${fileId} for user ${userId}`, 'ACCESS_DENIED', 403);
    this.name = 'FileAccessDeniedError';
  }
}

export class FileSizeExceededError extends EvidenceStorageError {
  constructor(fileSize: number, maxSize: number) {
    super(
      `File size ${fileSize} exceeds maximum allowed size ${maxSize}`,
      'FILE_SIZE_EXCEEDED',
      413
    );
    this.name = 'FileSizeExceededError';
  }
}

export class InvalidFileTypeError extends EvidenceStorageError {
  constructor(mimeType: string, allowedTypes: string[]) {
    super(
      `Invalid file type: ${mimeType}. Allowed types: ${allowedTypes.join(', ')}`,
      'INVALID_FILE_TYPE',
      415
    );
    this.name = 'InvalidFileTypeError';
  }
}

export class SignedUrlExpiredError extends EvidenceStorageError {
  constructor(fileId: string) {
    super(`Signed URL for file ${fileId} has expired`, 'SIGNED_URL_EXPIRED', 410);
    this.name = 'SignedUrlExpiredError';
  }
}
