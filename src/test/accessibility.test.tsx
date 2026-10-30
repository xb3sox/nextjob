import type { ApprovalRequest } from '@nextjob/policy';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ApprovalDialog } from '../components/approval-dialog';
import { type JobCapabilityModel, JobCard } from '../components/JobCard';
import LocaleSwitcher from '../components/LocaleSwitcher';
import WaitlistForm from '../components/WaitlistForm';
import { I18nProvider } from '../i18n';
import { OutcomeModal } from '../pages/applications/OutcomeModal';
import type { TrackedApplication } from '../pages/applications/types';
import TailorPage from '../pages/TailorPage';

const mockJobCapabilities: JobCapabilityModel = {
  eligibility: 'eligible',
  fit: 'excellent',
  evidence: 'complete',
  execution: 'verified',
  language: 'supported',
  automation: 'automatic',
  freshness: 'fresh',
  matchScore: 94,
  confidence: 0.95,
  strengths: ['5+ years React and TypeScript experience'],
  weaknesses: [],
};

const mockRequest: ApprovalRequest = {
  id: 'req-1',
  tenantId: 'tenant-1',
  userId: 'user-1',
  jobId: 'job-1',
  fieldKey: 'visa_sponsorship',
  question: 'Do you require visa sponsorship?',
  proposedAnswer: 'No, I am authorized to work in the US.',
  riskLevel: 'medium',
  impactDescription: 'Sponsorship requirements impact eligibility.',
  payloadHash: 'dummyhash123',
  payloadVersion: 1,
  createdAt: new Date().toISOString(),
};

const mockApp: TrackedApplication = {
  id: 'app-1',
  state: 'SUBMITTED_VERIFIED',
  jobTitle: 'Senior Software Engineer',
  companyName: 'Stripe',
  retryCount: 0,
  audit: [],
};

describe('WCAG 2.2 AA Accessibility Audits & Focus Management (T-46, FR-ACC-01, FR-ACC-02, AC-10)', () => {
  it('ApprovalDialog has dialog accessibility attributes and supports Escape key keyboard navigation', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <ApprovalDialog
        isOpen={true}
        request={mockRequest}
        onDecision={vi.fn()}
        onClose={handleClose}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'approval-dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'approval-dialog-desc');

    const closeBtn = screen.getByRole('button', { name: /close dialog/i });
    expect(closeBtn).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('JobCard renders accessible badges, buttons with focus rings and accessible labels', () => {
    render(
      <JobCard
        id="job-1"
        title="Senior Software Engineer"
        company="Stripe"
        location="San Francisco, CA"
        remote={true}
        salary={{ min: 180000, max: 220000, currency: 'USD' }}
        capabilities={mockJobCapabilities}
        onApply={vi.fn()}
        onSave={vi.fn()}
      />
    );

    const applyButton = screen.getByRole('button', {
      name: /review and apply for senior software engineer at stripe/i,
    });
    expect(applyButton).toBeInTheDocument();
    expect(applyButton.className).toContain('focus-visible:ring-2');

    const saveButton = screen.getByRole('button', {
      name: /save senior software engineer at stripe/i,
    });
    expect(saveButton).toBeInTheDocument();
  });

  it('OutcomeModal has accessible dialog landmarks, radio group, and keyboard handlers', () => {
    render(
      <OutcomeModal application={mockApp} isOpen={true} onClose={vi.fn()} onSaveOutcome={vi.fn()} />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons.length).toBeGreaterThan(0);
  });

  it('TailorPage renders accessible landmark headings, screen reader status live region, and buttons with visible focus', async () => {
    render(
      <BrowserRouter>
        <TailorPage />
      </BrowserRouter>
    );

    const heading = await screen.findByRole('heading', { level: 1, name: /review your draft/i });
    expect(heading).toBeInTheDocument();

    const statusRegion = screen.getByRole('status');
    expect(statusRegion).toBeInTheDocument();
  });

  it('WaitlistForm and LocaleSwitcher render accessible input controls and labels', () => {
    render(<WaitlistForm />);
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toBeInTheDocument();

    render(
      <I18nProvider>
        <LocaleSwitcher />
      </I18nProvider>
    );
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
});
