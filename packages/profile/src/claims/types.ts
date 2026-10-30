import { z } from 'zod';

// ============================================================================
// Profile Claim Types
// ============================================================================

export type ClaimType =
  | 'experience'
  | 'education'
  | 'skill'
  | 'certification'
  | 'project'
  | 'achievement'
  | 'language';

export type VerificationStatus = 'unverified' | 'verified' | 'rejected' | 'pending_review';

// ============================================================================
// Profile Claim Schema
// ============================================================================

export const ProfileClaimSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  tenantId: z.string().min(1),

  // Claim metadata
  type: z.enum([
    'experience',
    'education',
    'skill',
    'certification',
    'project',
    'achievement',
    'language',
  ]),
  title: z.string().min(1),
  description: z.string().optional(),

  // Evidence tracking
  evidenceId: z.string().min(1).optional(),
  evidenceSource: z.string().optional(), // e.g., "resume.pdf", "linkedin.com", "manual"
  evidenceConfidence: z.number().min(0).max(1).optional(),

  // Verification
  verificationStatus: z
    .enum(['unverified', 'verified', 'rejected', 'pending_review'])
    .default('unverified'),
  verifiedAt: z.string().datetime().optional(),
  verifiedBy: z.string().min(1).optional(),
  verificationNotes: z.string().optional(),

  // Versioning
  version: z.number().int().positive().default(1),
  previousVersionId: z.string().min(1).optional(),

  // Content (varies by type)
  content: z.record(z.string(), z.any()),

  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().min(1),
  updatedBy: z.string().min(1),

  // Soft delete
  deleted: z.boolean().default(false),
  deletedAt: z.string().datetime().optional(),
});

export type ProfileClaim = z.infer<typeof ProfileClaimSchema>;

// ============================================================================
// Claim Content Schemas (by type)
// ============================================================================

export const ExperienceClaimContentSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  location: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  current: z.boolean().default(false),
  description: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});

export const EducationClaimContentSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  gpa: z.string().optional(),
  honors: z.array(z.string()).optional(),
});

export const SkillClaimContentSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  yearsOfExperience: z.number().optional(),
  endorsements: z.number().optional(),
});

export const CertificationClaimContentSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  issueDate: z.string().datetime(),
  expirationDate: z.string().datetime().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional(),
});

export const ProjectClaimContentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  technologies: z.array(z.string()).optional(),
  role: z.string().optional(),
  outcomes: z.array(z.string()).optional(),
});

export const AchievementClaimContentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  issuer: z.string().optional(),
  category: z.string().optional(),
});

export const LanguageClaimContentSchema = z.object({
  language: z.string().min(1),
  proficiency: z.enum(['native', 'fluent', 'professional', 'intermediate', 'basic']),
  certification: z.string().optional(),
});

// ============================================================================
// Evidence Types
// ============================================================================

export type EvidenceType =
  | 'resume'
  | 'certificate'
  | 'transcript'
  | 'portfolio'
  | 'reference'
  | 'verification_link'
  | 'other';

export const EvidenceSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  tenantId: z.string().min(1),

  // Evidence metadata
  type: z.enum([
    'resume',
    'certificate',
    'transcript',
    'portfolio',
    'reference',
    'verification_link',
    'other',
  ]),
  name: z.string().min(1),
  description: z.string().optional(),

  // Storage
  storageType: z.enum(['s3', 'url', 'text']),
  storageKey: z.string().optional(), // S3 key or URL
  content: z.string().optional(), // For text-based evidence

  // File metadata
  mimeType: z.string().optional(),
  fileSize: z.number().optional(),
  hash: z.string().optional(), // SHA-256 hash for integrity

  // Verification
  verified: z.boolean().default(false),
  verifiedAt: z.string().datetime().optional(),
  verifiedBy: z.string().min(1).optional(),

  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().min(1),

  // Soft delete
  deleted: z.boolean().default(false),
  deletedAt: z.string().datetime().optional(),
});

export type Evidence = z.infer<typeof EvidenceSchema>;

// ============================================================================
// Profile Version Types
// ============================================================================

export const ProfileVersionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  tenantId: z.string().min(1),

  version: z.number().int().positive(),
  claimIds: z.array(z.string().min(1)),

  // Snapshot of profile at this version
  snapshot: z.record(z.string(), z.any()),

  // Metadata
  createdAt: z.string().datetime(),
  createdBy: z.string().min(1),
  changeDescription: z.string().optional(),
});

export type ProfileVersion = z.infer<typeof ProfileVersionSchema>;

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateClaimRequest {
  userId: string;
  tenantId: string;
  type: ClaimType;
  title: string;
  description?: string;
  content: Record<string, any>;
  evidenceId?: string;
  evidenceSource?: string;
}

export interface UpdateClaimRequest {
  title?: string;
  description?: string;
  content?: Record<string, any>;
  verificationStatus?: VerificationStatus;
  verificationNotes?: string;
}

export interface VerifyClaimRequest {
  verificationStatus: VerificationStatus;
  verifiedBy: string;
  verificationNotes?: string;
}

export interface CreateEvidenceRequest {
  userId: string;
  tenantId: string;
  type: EvidenceType;
  name: string;
  description?: string;
  storageType: 's3' | 'url' | 'text';
  storageKey?: string;
  content?: string;
  mimeType?: string;
  fileSize?: number;
  hash?: string;
}

export interface ClaimListResponse {
  claims: ProfileClaim[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface EvidenceListResponse {
  evidence: Evidence[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export class ProfileError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'ProfileError';
  }
}

export class ClaimNotFoundError extends ProfileError {
  constructor(claimId: string) {
    super(`Claim not found: ${claimId}`, 'CLAIM_NOT_FOUND', 404);
    this.name = 'ClaimNotFoundError';
  }
}

export class EvidenceNotFoundError extends ProfileError {
  constructor(evidenceId: string) {
    super(`Evidence not found: ${evidenceId}`, 'EVIDENCE_NOT_FOUND', 404);
    this.name = 'EvidenceNotFoundError';
  }
}

export class InvalidClaimContentError extends ProfileError {
  constructor(claimType: ClaimType, validationErrors: any) {
    super(`Invalid content for claim type ${claimType}`, 'INVALID_CLAIM_CONTENT', 400, {
      claimType,
      validationErrors,
    });
    this.name = 'InvalidClaimContentError';
  }
}

export class VersionConflictError extends ProfileError {
  constructor(claimId: string, currentVersion: number, requestedVersion: number) {
    super(
      `Version conflict for claim ${claimId}: current=${currentVersion}, requested=${requestedVersion}`,
      'VERSION_CONFLICT',
      409,
      { claimId, currentVersion, requestedVersion }
    );
    this.name = 'VersionConflictError';
  }
}
