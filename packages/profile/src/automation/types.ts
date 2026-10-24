import { z } from 'zod';

// ============================================================================
// Automation Mode Types
// ============================================================================

export type AutomationMode = 'manual' | 'copilot' | 'autopilot';

export type FieldRiskLevel = 'low' | 'medium' | 'high' | 'sensitive';

// ============================================================================
// Field Override Schema
// ============================================================================

export const FieldOverrideSchema = z.object({
  fieldName: z.string().min(1),
  mode: z.enum(['manual', 'copilot', 'autopilot']),
  riskLevel: z.enum(['low', 'medium', 'high', 'sensitive']),
  requiresApproval: z.boolean(),
  allowedValues: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type FieldOverride = z.infer<typeof FieldOverrideSchema>;

// ============================================================================
// Automation Policy Schema
// ============================================================================

export const AutomationPolicySchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  tenantId: z.string().min(1),

  // Default mode
  defaultMode: z.enum(['manual', 'copilot', 'autopilot']),

  // Field-level overrides
  fieldOverrides: z.array(FieldOverrideSchema).optional(),

  // Automation rules
  autoApply: z
    .object({
      enabled: z.boolean().default(false),
      maxApplicationsPerDay: z.number().min(0).optional(),
      requireEligibilityCheck: z.boolean().default(true),
      requireProfileCoverage: z.boolean().default(true),
      minProfileCoveragePercent: z.number().min(0).max(100).default(80),
    })
    .optional(),

  // Safety settings
  safetySettings: z
    .object({
      alwaysAskForSensitiveFields: z.boolean().default(true),
      blockAutoApplyWithoutVerification: z.boolean().default(true),
      requireExplicitApprovalForHighRisk: z.boolean().default(true),
      maxRetries: z.number().min(0).default(3),
    })
    .optional(),

  // Notification preferences
  notifications: z
    .object({
      notifyOnAutoApply: z.boolean().default(true),
      notifyOnApprovalRequired: z.boolean().default(true),
      notifyOnSubmissionComplete: z.boolean().default(true),
      notifyOnErrors: z.boolean().default(true),
    })
    .optional(),

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

export type AutomationPolicy = z.infer<typeof AutomationPolicySchema>;

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateAutomationPolicyRequest {
  userId: string;
  tenantId: string;
  defaultMode: AutomationMode;
  fieldOverrides?: FieldOverride[];
  autoApply?: {
    enabled?: boolean;
    maxApplicationsPerDay?: number;
    requireEligibilityCheck?: boolean;
    requireProfileCoverage?: boolean;
    minProfileCoveragePercent?: number;
  };
  safetySettings?: {
    alwaysAskForSensitiveFields?: boolean;
    blockAutoApplyWithoutVerification?: boolean;
    requireExplicitApprovalForHighRisk?: boolean;
    maxRetries?: number;
  };
  notifications?: {
    notifyOnAutoApply?: boolean;
    notifyOnApprovalRequired?: boolean;
    notifyOnSubmissionComplete?: boolean;
    notifyOnErrors?: boolean;
  };
}

export interface UpdateAutomationPolicyRequest {
  defaultMode?: AutomationMode;
  fieldOverrides?: FieldOverride[];
  autoApply?: {
    enabled?: boolean;
    maxApplicationsPerDay?: number;
    requireEligibilityCheck?: boolean;
    requireProfileCoverage?: boolean;
    minProfileCoveragePercent?: number;
  };
  safetySettings?: {
    alwaysAskForSensitiveFields?: boolean;
    blockAutoApplyWithoutVerification?: boolean;
    requireExplicitApprovalForHighRisk?: boolean;
    maxRetries?: number;
  };
  notifications?: {
    notifyOnAutoApply?: boolean;
    notifyOnApprovalRequired?: boolean;
    notifyOnSubmissionComplete?: boolean;
    notifyOnErrors?: boolean;
  };
}

export interface AutomationPolicyResponse {
  policy: AutomationPolicy;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class AutomationPolicyError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'AutomationPolicyError';
  }
}

export class AutomationPolicyNotFoundError extends AutomationPolicyError {
  constructor(userId: string) {
    super(`Automation policy not found for user: ${userId}`, 'POLICY_NOT_FOUND', 404);
    this.name = 'AutomationPolicyNotFoundError';
  }
}

export class InvalidAutomationPolicyError extends AutomationPolicyError {
  constructor(validationErrors: any) {
    super('Invalid automation policy data', 'INVALID_POLICY', 400, { validationErrors });
    this.name = 'InvalidAutomationPolicyError';
  }
}

export class VersionConflictError extends AutomationPolicyError {
  constructor(currentVersion: number, requestedVersion: number) {
    super(
      `Version conflict: current=${currentVersion}, requested=${requestedVersion}`,
      'VERSION_CONFLICT',
      409,
      { currentVersion, requestedVersion }
    );
    this.name = 'VersionConflictError';
  }
}
