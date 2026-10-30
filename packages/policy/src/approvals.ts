import crypto from 'node:crypto';
import type { RiskLevel } from './types';

export type ApprovalDecision = 'approve_once' | 'approve_always' | 'edit' | 'reject' | 'block';

export interface ApprovalRequest {
  id: string;
  tenantId: string;
  userId: string;
  jobId: string;
  fieldKey: string;
  question: string;
  proposedAnswer?: string;
  evidenceClaimIds?: string[];
  riskLevel: RiskLevel;
  impactDescription: string;
  payloadHash: string;
  payloadVersion: number;
  createdAt: string;
}

export interface ApprovalRecord {
  id: string;
  requestId: string;
  decision: ApprovalDecision;
  editedAnswer?: string;
  payloadHash: string;
  payloadVersion: number;
  decidedAt: string;
  userId: string;
}

export interface CreateApprovalRequestParams {
  tenantId: string;
  userId: string;
  jobId: string;
  fieldKey: string;
  question: string;
  proposedAnswer?: string;
  evidenceClaimIds?: string[];
  riskLevel: RiskLevel;
  impactDescription?: string;
  payloadVersion?: number;
}

export class ApprovalService {
  private savedPreferences: Map<string, { decision: 'approve_always' | 'block'; answer?: string }> =
    new Map();

  /**
   * Generates a deterministic hash of the question and payload
   */
  public computePayloadHash(question: string, proposedAnswer?: string): string {
    const raw = `${question.trim().toLowerCase()}:${(proposedAnswer || '').trim()}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Creates a formal approval request referencing the exact question, answer, and version.
   */
  public createRequest(params: CreateApprovalRequestParams): ApprovalRequest {
    const payloadHash = this.computePayloadHash(params.question, params.proposedAnswer);

    const impact =
      params.impactDescription ||
      (params.riskLevel === 'sensitive'
        ? 'Sensitive personal demographics submitted directly to external employer ATS'
        : params.riskLevel === 'high'
          ? 'Binding application commitment (compensation or availability)'
          : 'Profile tailoring statement');

    return {
      id: crypto.randomUUID(),
      tenantId: params.tenantId,
      userId: params.userId,
      jobId: params.jobId,
      fieldKey: params.fieldKey,
      question: params.question,
      proposedAnswer: params.proposedAnswer,
      evidenceClaimIds: params.evidenceClaimIds || [],
      riskLevel: params.riskLevel,
      impactDescription: impact,
      payloadHash,
      payloadVersion: params.payloadVersion || 1,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Checks if candidate has a saved `approve_always` or `block` rule for this question.
   */
  public getSavedPreference(
    userId: string,
    question: string
  ): { decision: 'approve_always' | 'block'; answer?: string } | undefined {
    const key = `${userId}:${question.trim().toLowerCase()}`;
    return this.savedPreferences.get(key);
  }

  /**
   * Resolves an approval request with user's explicit decision.
   */
  public resolveRequest(
    request: ApprovalRequest,
    decision: ApprovalDecision,
    options: {
      userId: string;
      editedAnswer?: string;
    }
  ): ApprovalRecord {
    if (decision === 'edit' && !options.editedAnswer?.trim()) {
      throw new Error('Edited answer must be provided when decision is "edit"');
    }

    // Persist approve_always or block rules
    if (decision === 'approve_always') {
      const key = `${options.userId}:${request.question.trim().toLowerCase()}`;
      this.savedPreferences.set(key, {
        decision: 'approve_always',
        answer: request.proposedAnswer,
      });
    } else if (decision === 'block') {
      const key = `${options.userId}:${request.question.trim().toLowerCase()}`;
      this.savedPreferences.set(key, {
        decision: 'block',
      });
    }

    return {
      id: crypto.randomUUID(),
      requestId: request.id,
      decision,
      editedAnswer: decision === 'edit' ? options.editedAnswer?.trim() : undefined,
      payloadHash: request.payloadHash,
      payloadVersion: request.payloadVersion,
      decidedAt: new Date().toISOString(),
      userId: options.userId,
    };
  }

  /**
   * Clears saved preferences (for testing)
   */
  public clearPreferences(): void {
    this.savedPreferences.clear();
  }
}

export const defaultApprovalService = new ApprovalService();
