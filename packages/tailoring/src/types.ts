import { z } from 'zod';

// ============================================================================
// Tailoring Types
// ============================================================================

export type TailoringType = 
  | 'resume'
  | 'cover_letter'
  | 'application_answer'
  | 'professional_summary'
  | 'skills_section';

export interface TailoringRequest {
  type: TailoringType;
  careerGraph: CareerGraph;
  jobRequirements: JobRequirements;
  question?: string; // For application_answer type
  options?: TailoringOptions;
}

export interface TailoringOptions {
  maxLength?: number;
  tone?: 'professional' | 'casual' | 'formal';
  includeSections?: string[];
  excludeSections?: string[];
}

export interface TailoringResult {
  type: TailoringType;
  content: string;
  sections?: TailoredSection[];
  skills?: TailoredSkill[];
  evidenceTraceability: EvidenceTrace[];
  unsupportedClaims: string[];
  confidence: number;
  warnings: string[];
}

export interface TailoredSection {
  type: string;
  content: string;
  evidenceClaimIds: string[];
  preserved: string[];
}

export interface TailoredSkill {
  name: string;
  level: string;
  evidenceClaimId: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface EvidenceTrace {
  claimId: string;
  claimType: string;
  content: string;
  usedIn: string[];
}

// ============================================================================
// Career Graph Types
// ============================================================================

export interface CareerGraph {
  claims: CareerClaim[];
}

export interface CareerClaim {
  id: string;
  type: ClaimType;
  title: string;
  content: any;
  evidenceId: string | null;
  verificationStatus: 'verified' | 'unverified' | 'pending';
  confidence: number;
}

export type ClaimType = 
  | 'experience'
  | 'education'
  | 'skill'
  | 'certification'
  | 'project'
  | 'achievement'
  | 'language'
  | 'preference';

// ============================================================================
// Job Requirements Types
// ============================================================================

export interface JobRequirements {
  title: string;
  company?: string;
  description?: string;
  requiredSkills?: string[];
  preferredSkills?: string[];
  experience?: {
    min?: number;
    max?: number;
  };
  education?: {
    minimumDegree?: string;
    requiredFields?: string[];
  };
  location?: {
    country?: string;
    city?: string;
    remote?: boolean;
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  certifications?: string[];
  languages?: Array<{
    language: string;
    proficiency: string;
  }>;
}

// ============================================================================
// Evidence Constraint Types
// ============================================================================

export interface EvidenceConstraint {
  type: 'no_fabrication' | 'no_upgrade' | 'preserve_exact' | 'confidence_threshold';
  field: string;
  value?: any;
  message: string;
}

export interface ConstraintViolation {
  constraint: EvidenceConstraint;
  claimId: string;
  details: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

export const CareerClaimSchema = z.object({
  id: z.string(),
  type: z.enum([
    'experience',
    'education',
    'skill',
    'certification',
    'project',
    'achievement',
    'language',
    'preference',
  ]),
  title: z.string(),
  content: z.any(),
  evidenceId: z.string().nullable(),
  verificationStatus: z.enum(['verified', 'unverified', 'pending']),
  confidence: z.number().min(0).max(1),
});

export const CareerGraphSchema = z.object({
  claims: z.array(CareerClaimSchema),
});

export const JobRequirementsSchema = z.object({
  title: z.string(),
  company: z.string().optional(),
  description: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  preferredSkills: z.array(z.string()).optional(),
  experience: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  education: z.object({
    minimumDegree: z.string().optional(),
    requiredFields: z.array(z.string()).optional(),
  }).optional(),
  location: z.object({
    country: z.string().optional(),
    city: z.string().optional(),
    remote: z.boolean().optional(),
  }).optional(),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    currency: z.string().optional(),
  }).optional(),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.object({
    language: z.string(),
    proficiency: z.string(),
  })).optional(),
});

export const TailoringRequestSchema = z.object({
  type: z.enum([
    'resume',
    'cover_letter',
    'application_answer',
    'professional_summary',
    'skills_section',
  ]),
  careerGraph: CareerGraphSchema,
  jobRequirements: JobRequirementsSchema,
  question: z.string().optional(),
  options: z.object({
    maxLength: z.number().optional(),
    tone: z.enum(['professional', 'casual', 'formal']).optional(),
    includeSections: z.array(z.string()).optional(),
    excludeSections: z.array(z.string()).optional(),
  }).optional(),
});

// ============================================================================
// Error Types
// ============================================================================

export class TailoringError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'TailoringError';
  }
}

export class EvidenceConstraintViolationError extends TailoringError {
  constructor(
    public violations: ConstraintViolation[]
  ) {
    super(
      `Evidence constraint violations: ${violations.map(v => v.details).join(', ')}`,
      'EVIDENCE_CONSTRAINT_VIOLATION',
      400,
      { violations }
    );
    this.name = 'EvidenceConstraintViolationError';
  }
}

export class InsufficientEvidenceError extends TailoringError {
  constructor(requiredType: string) {
    super(
      `Insufficient evidence for ${requiredType}`,
      'INSUFFICIENT_EVIDENCE',
      400,
      { requiredType }
    );
    this.name = 'InsufficientEvidenceError';
  }
}

export class InvalidTailoringRequestError extends TailoringError {
  constructor(validationErrors: any) {
    super(
      'Invalid tailoring request',
      'INVALID_REQUEST',
      400,
      { validationErrors }
    );
    this.name = 'InvalidTailoringRequestError';
  }
}
