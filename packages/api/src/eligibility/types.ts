import { z } from 'zod';

// ============================================================================
// Eligibility Types
// ============================================================================

export type EligibilityStatus = 'eligible' | 'ineligible' | 'unknown';

export type EligibilityCheckType = 
  | 'location'
  | 'work_authorization'
  | 'sponsorship'
  | 'license'
  | 'certification'
  | 'education'
  | 'experience'
  | 'skill'
  | 'language'
  | 'clearance';

export interface EligibilityCheck {
  type: EligibilityCheckType;
  status: EligibilityStatus;
  required: boolean;
  reason?: string;
  details?: any;
}

// ============================================================================
// Eligibility Rule Schema
// ============================================================================

export const EligibilityRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Rule metadata
  name: z.string().min(1),
  description: z.string().optional(),
  checkType: z.enum([
    'location',
    'work_authorization',
    'sponsorship',
    'license',
    'certification',
    'education',
    'experience',
    'skill',
    'language',
    'clearance',
  ]),
  
  // Rule configuration
  required: z.boolean().default(true),
  condition: z.record(z.any()), // Rule-specific condition
  
  // Priority and ordering
  priority: z.number().int().default(0), // Higher = checked first
  
  // Metadata
  version: z.number().int().positive().default(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
  updatedBy: z.string().uuid(),
  
  // Soft delete
  deleted: z.boolean().default(false),
  deletedAt: z.string().datetime().optional(),
});

export type EligibilityRule = z.infer<typeof EligibilityRuleSchema>;

// ============================================================================
// Eligibility Assessment Schema
// ============================================================================

export const EligibilityAssessmentSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  jobId: z.string().uuid(),
  
  // Overall status
  status: z.enum(['eligible', 'ineligible', 'unknown']),
  confidence: z.number().min(0).max(1),
  
  // Detailed checks
  checks: z.array(z.object({
    type: z.string(),
    status: z.enum(['eligible', 'ineligible', 'unknown']),
    required: z.boolean(),
    reason: z.string().optional(),
    details: z.any().optional(),
  })),
  
  // Missing requirements
  missingRequirements: z.array(z.string()).optional(),
  
  // Warnings
  warnings: z.array(z.string()).optional(),
  
  // Metadata
  assessedAt: z.string().datetime(),
  ruleVersion: z.number().int(),
  
  // Soft delete
  deleted: z.boolean().default(false),
  deletedAt: z.string().datetime().optional(),
});

export type EligibilityAssessment = z.infer<typeof EligibilityAssessmentSchema>;

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CheckEligibilityRequest {
  userId: string;
  tenantId: string;
  jobId: string;
}

export interface CheckEligibilityResponse {
  assessment: EligibilityAssessment;
  eligible: boolean;
  unknown: boolean;
  summary: {
    total: number;
    passed: number;
    failed: number;
    unknown: number;
  };
}

export interface CreateRuleRequest {
  tenantId: string;
  name: string;
  description?: string;
  checkType: EligibilityCheckType;
  required?: boolean;
  condition: Record<string, any>;
  priority?: number;
  userId: string;
}

export interface UpdateRuleRequest {
  name?: string;
  description?: string;
  required?: boolean;
  condition?: Record<string, any>;
  priority?: number;
}

export interface ListRulesRequest {
  tenantId: string;
  checkType?: EligibilityCheckType;
  required?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ListRulesResponse {
  rules: EligibilityRule[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export class EligibilityError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'EligibilityError';
  }
}

export class RuleNotFoundError extends EligibilityError {
  constructor(ruleId: string) {
    super(`Eligibility rule not found: ${ruleId}`, 'RULE_NOT_FOUND', 404);
    this.name = 'RuleNotFoundError';
  }
}

export class AssessmentNotFoundError extends EligibilityError {
  constructor(assessmentId: string) {
    super(`Eligibility assessment not found: ${assessmentId}`, 'ASSESSMENT_NOT_FOUND', 404);
    this.name = 'AssessmentNotFoundError';
  }
}

export class InvalidRuleError extends EligibilityError {
  constructor(validationErrors: any) {
    super(
      'Invalid eligibility rule',
      'INVALID_RULE',
      400,
      { validationErrors }
    );
    this.name = 'InvalidRuleError';
  }
}
