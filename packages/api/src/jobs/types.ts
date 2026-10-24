import { z } from 'zod';

// ============================================================================
// Job Types
// ============================================================================

export type JobSource = 'linkedin' | 'indeed' | 'glassdoor' | 'company_website' | 'api' | 'manual';

export type WorkMode = 'remote' | 'hybrid' | 'on-site' | 'any';

export type JobStatus = 'active' | 'closed' | 'expired' | 'draft';

export type SeniorityLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

// ============================================================================
// Job Schema
// ============================================================================

export const JobSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),

  // Source information
  source: z.enum(['linkedin', 'indeed', 'glassdoor', 'company_website', 'api', 'manual']),
  externalId: z.string().optional(), // ID from external source
  sourceUrl: z.string().url().optional(),

  // Company information
  companyId: z.string().min(1).optional(),
  companyName: z.string().min(1),
  companyWebsite: z.string().url().optional(),
  companySize: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  companyIndustry: z.string().optional(),

  // Job details
  title: z.string().min(1),
  description: z.string(),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),

  // Location
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().min(1),
    remote: z.boolean().default(false),
  }),

  // Work mode
  workMode: z.enum(['remote', 'hybrid', 'on-site', 'any']).default('any'),

  // Salary
  salary: z
    .object({
      min: z.number().positive().optional(),
      max: z.number().positive().optional(),
      currency: z.string().default('USD'),
      period: z.enum(['hourly', 'daily', 'monthly', 'yearly']).default('yearly'),
    })
    .optional(),

  // Job classification
  seniorityLevel: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional(),
  roleFamily: z.string().optional(), // e.g., "Engineering", "Marketing"

  // Skills and requirements
  requiredSkills: z.array(z.string()).optional(),
  preferredSkills: z.array(z.string()).optional(),
  requiredExperience: z.number().optional(), // years
  requiredEducation: z.string().optional(),

  // Sponsorship and visa
  requiresSponsorship: z.boolean().optional(),
  visaSponsorship: z.boolean().optional(),

  // Application
  applicationUrl: z.string().url().optional(),
  applicationEmail: z.string().email().optional(),
  applicationInstructions: z.string().optional(),

  // Status and dates
  status: z.enum(['active', 'closed', 'expired', 'draft']).default('active'),
  postedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  lastSeenAt: z.string().datetime(),

  // Freshness tracking
  freshnessScore: z.number().min(0).max(1).default(1), // 1 = fresh, 0 = stale

  // Deduplication
  canonicalId: z.string().min(1).optional(), // Points to canonical version if duplicate
  duplicateOf: z.string().min(1).optional(), // Points to original if this is a duplicate

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

export type Job = z.infer<typeof JobSchema>;

// ============================================================================
// Company Schema
// ============================================================================

export const CompanySchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),

  name: z.string().min(1),
  website: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  description: z.string().optional(),

  // Company details
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  foundedYear: z.number().optional(),
  headquarters: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),

  // External IDs
  linkedinUrl: z.string().url().optional(),
  glassdoorUrl: z.string().url().optional(),
  crunchbaseUrl: z.string().url().optional(),

  // Metadata
  version: z.number().int().positive().default(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),

  // Soft delete
  deleted: z.boolean().default(false),
  deletedAt: z.string().datetime().optional(),
});

export type Company = z.infer<typeof CompanySchema>;

// ============================================================================
// Request/Response Types
// ============================================================================

export interface IngestJobRequest {
  tenantId: string;
  source: JobSource;
  externalId?: string;
  sourceUrl?: string;
  companyName: string;
  companyWebsite?: string;
  companySize?: Company['size'];
  companyIndustry?: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  location: {
    city?: string;
    state?: string;
    country: string;
    remote?: boolean;
  };
  workMode?: WorkMode;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
    period?: 'hourly' | 'daily' | 'monthly' | 'yearly';
  };
  seniorityLevel?: SeniorityLevel;
  roleFamily?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  requiredExperience?: number;
  requiredEducation?: string;
  requiresSponsorship?: boolean;
  visaSponsorship?: boolean;
  applicationUrl?: string;
  applicationEmail?: string;
  applicationInstructions?: string;
  postedAt?: string;
  expiresAt?: string;
  userId: string;
}

export interface IngestJobResponse {
  job: Job;
  isDuplicate: boolean;
  canonicalJobId?: string;
  company?: Company;
}

export interface NormalizeJobRequest {
  job: Partial<Job>;
}

export interface NormalizeJobResponse {
  normalized: Partial<Job>;
  changes: Array<{
    field: string;
    original: any;
    normalized: any;
  }>;
}

export interface ListJobsRequest {
  tenantId: string;
  status?: JobStatus;
  source?: JobSource;
  location?: string;
  workMode?: WorkMode;
  seniorityLevel?: SeniorityLevel;
  requiredSkills?: string[];
  page?: number;
  pageSize?: number;
}

export interface ListJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export class JobIngestionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'JobIngestionError';
  }
}

export class JobNotFoundError extends JobIngestionError {
  constructor(jobId: string) {
    super(`Job not found: ${jobId}`, 'JOB_NOT_FOUND', 404);
    this.name = 'JobNotFoundError';
  }
}

export class DuplicateJobError extends JobIngestionError {
  constructor(existingJobId: string, newJobData: any) {
    super(`Duplicate job detected. Existing job: ${existingJobId}`, 'DUPLICATE_JOB', 409, {
      existingJobId,
      newJobData,
    });
    this.name = 'DuplicateJobError';
  }
}

export class InvalidJobDataError extends JobIngestionError {
  constructor(validationErrors: any) {
    super('Invalid job data', 'INVALID_JOB_DATA', 400, { validationErrors });
    this.name = 'InvalidJobDataError';
  }
}

export class CompanyNotFoundError extends JobIngestionError {
  constructor(companyId: string) {
    super(`Company not found: ${companyId}`, 'COMPANY_NOT_FOUND', 404);
    this.name = 'CompanyNotFoundError';
  }
}
