import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { JobCapabilityModel } from './JobCard';
import { JobCard, JobCardSkeleton } from './JobCard';

describe('JobCard', () => {
  const mockCapabilities: JobCapabilityModel = {
    eligibility: 'eligible',
    fit: 'excellent',
    evidence: 'complete',
    execution: 'verified',
    language: 'supported',
    automation: 'automatic',
    freshness: 'fresh',
    matchScore: 92,
    confidence: 0.95,
    strengths: [
      'Strong experience match',
      'Required skills verified',
      'Location matches preferences',
    ],
    weaknesses: ['Preferred certification not found'],
  };

  const defaultProps = {
    id: 'job-1',
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    remote: true,
    salary: { min: 150000, max: 200000, currency: 'USD' },
    capabilities: mockCapabilities,
  };

  it('renders job title and company', () => {
    render(<JobCard {...defaultProps} />);

    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
  });

  it('renders location with remote indicator', () => {
    render(<JobCard {...defaultProps} />);

    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText('· Remote')).toBeInTheDocument();
  });

  it('renders salary range', () => {
    render(<JobCard {...defaultProps} />);

    expect(screen.getByText('$150k - $200k')).toBeInTheDocument();
  });

  it('renders match badge with correct status', () => {
    render(<JobCard {...defaultProps} />);

    expect(screen.getByText('Excellent match · 92%')).toBeInTheDocument();
  });

  it('renders eligibility badge for eligible job', () => {
    render(<JobCard {...defaultProps} />);

    expect(screen.getByText('You can apply')).toBeInTheDocument();
  });

  it('renders eligibility badge for ineligible job', () => {
    render(
      <JobCard
        {...defaultProps}
        capabilities={{
          ...mockCapabilities,
          eligibility: 'ineligible',
        }}
      />
    );

    expect(screen.getByText('Probably not eligible')).toBeInTheDocument();
  });

  it('renders eligibility badge for unknown eligibility', () => {
    render(
      <JobCard
        {...defaultProps}
        capabilities={{
          ...mockCapabilities,
          eligibility: 'unknown',
        }}
      />
    );

    expect(screen.getByText('Check before applying')).toBeInTheDocument();
  });

  it('renders strengths', () => {
    render(<JobCard {...defaultProps} />);

    expect(screen.getByText('Why it fits')).toBeInTheDocument();
    expect(screen.getByText('Strong experience match')).toBeInTheDocument();
    expect(screen.getByText('Required skills verified')).toBeInTheDocument();
    expect(screen.getByText('Location matches preferences')).toBeInTheDocument();
  });

  it('renders weaknesses', () => {
    render(<JobCard {...defaultProps} />);

    expect(screen.getByText('Gaps')).toBeInTheDocument();
    expect(screen.getByText('Preferred certification not found')).toBeInTheDocument();
  });

  it('renders missing requirements instead of weaknesses when present', () => {
    render(
      <JobCard
        {...defaultProps}
        capabilities={{
          ...mockCapabilities,
          missingRequirements: ['US work authorization'],
          weaknesses: [],
        }}
      />
    );

    expect(screen.getByText('Missing')).toBeInTheDocument();
    expect(screen.getByText('US work authorization')).toBeInTheDocument();
  });

  it('renders capability dimensions', () => {
    render(<JobCard {...defaultProps} />);

    expect(screen.getByText('Capability Model')).toBeInTheDocument();
    expect(screen.getByText('Evidence')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('Execution')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
    expect(screen.getByText('Supported')).toBeInTheDocument();
    expect(screen.getByText('Automation')).toBeInTheDocument();
    expect(screen.getByText('Automatic')).toBeInTheDocument();
    expect(screen.getByText('Freshness')).toBeInTheDocument();
    expect(screen.getByText('Fresh')).toBeInTheDocument();
    expect(screen.getByText('Confidence')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('renders action buttons when handlers provided with proper accessible labels', () => {
    const onApply = vi.fn();
    const onSave = vi.fn();
    const onSkip = vi.fn();
    const onView = vi.fn();

    render(
      <JobCard
        {...defaultProps}
        onApply={onApply}
        onSave={onSave}
        onSkip={onSkip}
        onView={onView}
      />
    );
    expect(
      screen.getByRole('button', {
        name: 'Review and apply for Senior Software Engineer at Tech Corp',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Save Senior Software Engineer at Tech Corp',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Skip Senior Software Engineer at Tech Corp',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'View details for Senior Software Engineer at Tech Corp',
      })
    ).toBeInTheDocument();
  });

  it('renders ineligible apply button with descriptive inaccessible aria-label', () => {
    const onApply = vi.fn();
    render(
      <JobCard
        {...defaultProps}
        onApply={onApply}
        capabilities={{
          ...mockCapabilities,
          eligibility: 'ineligible',
        }}
      />
    );

    expect(
      screen.getByRole('button', {
        name: 'Not eligible to apply for Senior Software Engineer at Tech Corp',
      })
    ).toBeDisabled();
  });

  it('calls onApply when apply button clicked', () => {
    const onApply = vi.fn();
    render(<JobCard {...defaultProps} onApply={onApply} />);

    fireEvent.click(screen.getByText('Review & Apply'));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('calls onSave when save button clicked', () => {
    const onSave = vi.fn();
    render(<JobCard {...defaultProps} onSave={onSave} />);

    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onSkip when skip button clicked', () => {
    const onSkip = vi.fn();
    render(<JobCard {...defaultProps} onSkip={onSkip} />);

    fireEvent.click(screen.getByText('Skip'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('calls onView when view button clicked', () => {
    const onView = vi.fn();
    render(<JobCard {...defaultProps} onView={onView} />);

    fireEvent.click(screen.getByText('View Details'));
    expect(onView).toHaveBeenCalledTimes(1);
  });

  it('disables apply button when ineligible and provides tooltip explanation', () => {
    const onApply = vi.fn();
    render(
      <JobCard
        {...defaultProps}
        onApply={onApply}
        capabilities={{
          ...mockCapabilities,
          eligibility: 'ineligible',
        }}
      />
    );

    const applyButton = screen.getByText('Not Eligible');
    expect(applyButton).toBeDisabled();
    expect(applyButton).toHaveAttribute(
      'title',
      'You do not meet the minimum eligibility criteria for this role'
    );
  });

  it('renders without salary when not provided', () => {
    render(<JobCard {...defaultProps} salary={undefined} />);

    expect(screen.queryByText(/\$\d+k/)).not.toBeInTheDocument();
  });

  it('renders without remote indicator when not remote', () => {
    render(<JobCard {...defaultProps} remote={false} />);

    expect(screen.queryByText('· Remote')).not.toBeInTheDocument();
  });

  it('handles good match status', () => {
    render(
      <JobCard
        {...defaultProps}
        capabilities={{
          ...mockCapabilities,
          fit: 'good',
          matchScore: 75,
        }}
      />
    );

    expect(screen.getByText('Good match · 75%')).toBeInTheDocument();
  });

  it('handles weak match status', () => {
    render(
      <JobCard
        {...defaultProps}
        capabilities={{
          ...mockCapabilities,
          fit: 'weak',
          matchScore: 55,
        }}
      />
    );

    expect(screen.getByText('Weak match · 55%')).toBeInTheDocument();
  });

  it('handles no match status', () => {
    render(
      <JobCard
        {...defaultProps}
        capabilities={{
          ...mockCapabilities,
          fit: 'none',
          matchScore: 20,
        }}
      />
    );

    expect(screen.getByText('No match · 20%')).toBeInTheDocument();
  });

  it('renders assisted execution status', () => {
    render(
      <JobCard
        {...defaultProps}
        capabilities={{
          ...mockCapabilities,
          execution: 'assisted',
        }}
      />
    );

    expect(screen.getByText('Assisted')).toBeInTheDocument();
  });

  it('renders manual execution status', () => {
    render(
      <JobCard
        {...defaultProps}
        capabilities={{
          ...mockCapabilities,
          execution: 'manual',
        }}
      />
    );

    expect(screen.getByText('Manual')).toBeInTheDocument();
  });

  it('renders review required automation status', () => {
    render(
      <JobCard
        {...defaultProps}
        capabilities={{
          ...mockCapabilities,
          automation: 'review_required',
        }}
      />
    );

    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  it('renders aging freshness status', () => {
    render(
      <JobCard
        {...defaultProps}
        capabilities={{
          ...mockCapabilities,
          freshness: 'aging',
        }}
      />
    );

    expect(screen.getByText('Aging')).toBeInTheDocument();
  });

  it('renders missing evidence status', () => {
    render(
      <JobCard
        {...defaultProps}
        capabilities={{
          ...mockCapabilities,
          evidence: 'missing',
        }}
      />
    );

    expect(screen.getByText('Missing')).toBeInTheDocument();
  });
});

describe('JobCardSkeleton', () => {
  it('renders skeleton without crashing', () => {
    const { container } = render(<JobCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has animate-pulse class', () => {
    const { container } = render(<JobCardSkeleton />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });
});
