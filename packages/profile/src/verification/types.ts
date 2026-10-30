import { z } from 'zod';

// ============================================================================
// Verification Types
// ============================================================================

export type VerificationAction = 'confirm' | 'edit' | 'remove' | 'mark_unverified';

export interface VerificationRequest {
  claimId: string;
  userId: string;
  tenantId: string;
  action: VerificationAction;
  editedContent?: Record<string, any>;
  notes?: string;
}

export interface VerificationResult {
  success: boolean;
  claimId: string;
  previousStatus: string;
  newStatus: string;
  version: number;
  verifiedAt: string;
  verifiedBy: string;
  notes?: string;
}

export interface BulkVerificationRequest {
  userId: string;
  tenantId: string;
  claims: Array<{
    claimId: string;
    action: VerificationAction;
    editedContent?: Record<string, any>;
    notes?: string;
  }>;
}

export interface BulkVerificationResult {
  total: number;
  successful: number;
  failed: number;
  results: VerificationResult[];
  errors: Array<{ claimId: string; error: string }>;
}

// ============================================================================
// Verification Schema
// ============================================================================

export const VerificationRequestSchema = z.object({
  claimId: z.string().min(1),
  userId: z.string().min(1),
  tenantId: z.string().min(1),
  action: z.enum(['confirm', 'edit', 'remove', 'mark_unverified']),
  editedContent: z.record(z.string(), z.any()).optional(),
  notes: z.string().optional(),
});

export const BulkVerificationRequestSchema = z.object({
  userId: z.string().min(1),
  tenantId: z.string().min(1),
  claims: z.array(
    z.object({
      claimId: z.string().min(1),
      action: z.enum(['confirm', 'edit', 'remove', 'mark_unverified']),
      editedContent: z.record(z.string(), z.any()).optional(),
      notes: z.string().optional(),
    })
  ),
});

// ============================================================================
// Verification Error Types
// ============================================================================

export class VerificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: any
  ) {
    super(message);
    this.name = 'VerificationError';
  }
}

export class ClaimAlreadyVerifiedError extends VerificationError {
  constructor(claimId: string) {
    super(`Claim ${claimId} is already verified`, 'CLAIM_ALREADY_VERIFIED', 409);
    this.name = 'ClaimAlreadyVerifiedError';
  }
}

export class InvalidVerificationActionError extends VerificationError {
  constructor(action: string, currentStatus: string) {
    super(
      `Invalid action '${action}' for claim with status '${currentStatus}'`,
      'INVALID_VERIFICATION_ACTION',
      400
    );
    this.name = 'InvalidVerificationActionError';
  }
}

export class ClaimNotFoundError extends VerificationError {
  constructor(claimId: string) {
    super(`Claim not found: ${claimId}`, 'CLAIM_NOT_FOUND', 404);
    this.name = 'ClaimNotFoundError';
  }
}
