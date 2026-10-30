import { beforeEach, describe, expect, it } from 'vitest';
import { ApprovalService } from './approvals';

describe('Approval Workflow (T-20, Phase 6)', () => {
  let service: ApprovalService;

  beforeEach(() => {
    service = new ApprovalService();
    service.clearPreferences();
  });

  const baseParams = {
    tenantId: 'tenant-100',
    userId: 'user-200',
    jobId: 'job-300',
    fieldKey: 'desired_salary',
    question: 'What is your expected annual compensation?',
    proposedAnswer: '$160,000 USD',
    riskLevel: 'high' as const,
    payloadVersion: 1,
  };

  it('creates an approval request with deterministic payload hash and version tracking', () => {
    const request = service.createRequest(baseParams);

    expect(request.id).toBeDefined();
    expect(request.payloadHash).toBeDefined();
    expect(request.payloadVersion).toBe(1);
    expect(request.question).toBe('What is your expected annual compensation?');
    expect(request.proposedAnswer).toBe('$160,000 USD');
    expect(request.impactDescription).toContain('compensation');
  });

  it('resolves request with approve_once', () => {
    const request = service.createRequest(baseParams);
    const record = service.resolveRequest(request, 'approve_once', {
      userId: 'user-200',
    });

    expect(record.decision).toBe('approve_once');
    expect(record.payloadHash).toBe(request.payloadHash);
    expect(record.payloadVersion).toBe(request.payloadVersion);
    expect(record.decidedAt).toBeDefined();
    expect(service.getSavedPreference('user-200', baseParams.question)).toBeUndefined();
  });

  it('persists approve_always preference for future identical questions', () => {
    const request = service.createRequest(baseParams);
    service.resolveRequest(request, 'approve_always', {
      userId: 'user-200',
    });

    const saved = service.getSavedPreference('user-200', baseParams.question);
    expect(saved).toBeDefined();
    expect(saved?.decision).toBe('approve_always');
    expect(saved?.answer).toBe('$160,000 USD');
  });

  it('resolves request with edit decision and captures edited answer', () => {
    const request = service.createRequest(baseParams);
    const record = service.resolveRequest(request, 'edit', {
      userId: 'user-200',
      editedAnswer: '$175,000 USD',
    });

    expect(record.decision).toBe('edit');
    expect(record.editedAnswer).toBe('$175,000 USD');
  });

  it('throws error when edit decision is made without an edited answer', () => {
    const request = service.createRequest(baseParams);
    expect(() => {
      service.resolveRequest(request, 'edit', {
        userId: 'user-200',
      });
    }).toThrow('Edited answer must be provided');
  });

  it('persists block decision to prevent future automation', () => {
    const request = service.createRequest(baseParams);
    service.resolveRequest(request, 'block', {
      userId: 'user-200',
    });

    const saved = service.getSavedPreference('user-200', baseParams.question);
    expect(saved?.decision).toBe('block');
  });
});
