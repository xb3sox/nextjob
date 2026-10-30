/** @vitest-environment happy-dom */

import type { ApprovalRequest } from '@nextjob/policy';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApprovalDialog } from './approval-dialog';

const MOCK_REQUEST: ApprovalRequest = {
  id: 'req-001',
  tenantId: 'tenant-100',
  userId: 'user-200',
  jobId: 'job-300',
  fieldKey: 'desired_salary',
  question: 'What is your target base salary?',
  proposedAnswer: '$170,000 USD',
  riskLevel: 'high',
  impactDescription: 'Binding compensation expectation submitted to recruiter',
  payloadHash: 'hash-abc-123',
  payloadVersion: 1,
  createdAt: '2026-10-30T12:00:00Z',
};

describe('ApprovalDialog (T-20, Phase 6)', () => {
  const onDecision = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ApprovalDialog
        isOpen={false}
        request={MOCK_REQUEST}
        onDecision={onDecision}
        onClose={onClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders question, proposed answer, risk level, and impact description', () => {
    render(
      <ApprovalDialog
        isOpen={true}
        request={MOCK_REQUEST}
        onDecision={onDecision}
        onClose={onClose}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('What is your target base salary?')).toBeInTheDocument();
    expect(screen.getByText('$170,000 USD')).toBeInTheDocument();
    expect(screen.getByText('HIGH Risk')).toBeInTheDocument();
    expect(screen.getByText(/Binding compensation expectation/i)).toBeInTheDocument();
    expect(screen.getByText('Payload v1')).toBeInTheDocument();
  });

  it('handles approve_once decision click', () => {
    render(
      <ApprovalDialog
        isOpen={true}
        request={MOCK_REQUEST}
        onDecision={onDecision}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Approve Once/i }));
    expect(onDecision).toHaveBeenCalledWith('approve_once');
  });

  it('handles approve_always decision click', () => {
    render(
      <ApprovalDialog
        isOpen={true}
        request={MOCK_REQUEST}
        onDecision={onDecision}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Always Approve/i }));
    expect(onDecision).toHaveBeenCalledWith('approve_always');
  });

  it('handles reject and block decisions', () => {
    const { rerender } = render(
      <ApprovalDialog
        isOpen={true}
        request={MOCK_REQUEST}
        onDecision={onDecision}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Reject/i }));
    expect(onDecision).toHaveBeenCalledWith('reject');

    rerender(
      <ApprovalDialog
        isOpen={true}
        request={MOCK_REQUEST}
        onDecision={onDecision}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Block Question/i }));
    expect(onDecision).toHaveBeenCalledWith('block');
  });

  it('allows inline editing and submits edited answer', () => {
    render(
      <ApprovalDialog
        isOpen={true}
        request={MOCK_REQUEST}
        onDecision={onDecision}
        onClose={onClose}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /^Edit$/i }));

    const textarea = screen.getByRole('textbox', { name: /Edit proposed answer/i });
    expect(textarea).toHaveValue('$170,000 USD');

    fireEvent.change(textarea, { target: { value: '$185,000 USD' } });
    fireEvent.click(screen.getByRole('button', { name: /Save & Approve/i }));

    expect(onDecision).toHaveBeenCalledWith('edit', '$185,000 USD');
  });
});
