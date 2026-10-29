import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApplicationCard } from './application-card';

describe('ApplicationCard', () => {
  const defaultProps = {
    id: 'app-1',
    title: 'Frontend Engineer',
    company: 'Acme Corp',
    location: 'Remote, US',
    remote: true,
    salary: { min: 120000, max: 160000, currency: 'USD' },
    strengths: ['React expertise', 'TypeScript proficiency'],
    gaps: ['GraphQL experience'],
  };

  it('renders title, company, location and salary', () => {
    render(<ApplicationCard {...defaultProps} />);

    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Remote, US')).toBeInTheDocument();
    expect(screen.getByText('$120k - $160k')).toBeInTheDocument();
  });

  it('renders action buttons with accessible aria labels', () => {
    const onApply = vi.fn();
    const onSave = vi.fn();
    const onSkip = vi.fn();

    render(<ApplicationCard {...defaultProps} onApply={onApply} onSave={onSave} onSkip={onSkip} />);

    expect(
      screen.getByRole('button', {
        name: 'Review and apply for Frontend Engineer at Acme Corp',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Save Frontend Engineer at Acme Corp',
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Skip Frontend Engineer at Acme Corp',
      })
    ).toBeInTheDocument();
  });

  it('handles button click events', () => {
    const onApply = vi.fn();
    const onSave = vi.fn();
    const onSkip = vi.fn();

    render(<ApplicationCard {...defaultProps} onApply={onApply} onSave={onSave} onSkip={onSkip} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Review and apply for Frontend Engineer at Acme Corp',
      })
    );
    expect(onApply).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Save Frontend Engineer at Acme Corp',
      })
    );
    expect(onSave).toHaveBeenCalledTimes(1);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Skip Frontend Engineer at Acme Corp',
      })
    );
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('disables apply button and shows ineligible label with tooltip when ineligible', () => {
    const onApply = vi.fn();

    render(<ApplicationCard {...defaultProps} eligibilityStatus="ineligible" onApply={onApply} />);

    const applyButton = screen.getByRole('button', {
      name: 'Not eligible to apply for Frontend Engineer at Acme Corp',
    });

    expect(applyButton).toBeDisabled();
    expect(applyButton).toHaveAttribute(
      'title',
      'You do not meet the minimum eligibility criteria for this role'
    );
    expect(screen.getByText('Not Eligible')).toBeInTheDocument();
  });
});
