import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  BeforeAfterComparison,
  COMPARISON_METRICS,
  NEXTJOB_STEPS,
  TRADITIONAL_STEPS,
} from './comparison';

describe('BeforeAfterComparison (T-70, FR-CRO-02)', () => {
  it('renders section heading and contextual value proposition', () => {
    render(<BeforeAfterComparison />);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: /how applying looks today vs\. with nextjob/i,
    });
    expect(heading).toBeInTheDocument();

    expect(screen.getByText(/before & after nextjob/i)).toBeInTheDocument();
    expect(
      screen.getByText(/traditional job hunting forces candidates to choose between/i)
    ).toBeInTheDocument();
  });

  it('renders defensible quantitative performance metrics', () => {
    render(<BeforeAfterComparison />);

    const metricsRegion = screen.getByRole('region', { name: /key performance metrics/i });
    expect(metricsRegion).toBeInTheDocument();

    for (const metric of COMPARISON_METRICS) {
      expect(screen.getByText(metric.label)).toBeInTheDocument();
      expect(screen.getByText(metric.value)).toBeInTheDocument();
      expect(screen.getByText(metric.comparison)).toBeInTheDocument();
    }

    expect(screen.getByText('93% faster')).toBeInTheDocument();
    expect(screen.getByText('100% backed')).toBeInTheDocument();
    expect(screen.getByText('3.2x higher')).toBeInTheDocument();
  });

  it('renders traditional method drawbacks with accessible landmarks and warnings', () => {
    render(<BeforeAfterComparison />);

    const traditionalRegion = screen.getByRole('region', {
      name: /the spray-and-pray black hole/i,
    });
    expect(traditionalRegion).toBeInTheDocument();
    expect(screen.getByText('Status Quo')).toBeInTheDocument();

    for (const step of TRADITIONAL_STEPS) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
      expect(screen.getByText(step.description)).toBeInTheDocument();
    }

    const drawbacks = screen.getAllByText(/drawback:/i);
    expect(drawbacks.length).toBe(TRADITIONAL_STEPS.length);
    expect(screen.getByText(/45\+ min \/ application/i)).toBeInTheDocument();
  });

  it('renders NextJob evidence-backed advantages with verified proof indicators', () => {
    render(<BeforeAfterComparison />);

    const nextjobRegion = screen.getByRole('region', {
      name: /the evidence-constrained workflow/i,
    });
    expect(nextjobRegion).toBeInTheDocument();
    expect(screen.getByText('Evidence-Backed')).toBeInTheDocument();

    for (const step of NEXTJOB_STEPS) {
      expect(screen.getByText(step.title)).toBeInTheDocument();
      expect(screen.getByText(step.description)).toBeInTheDocument();
    }

    const advantages = screen.getAllByText(/advantage:/i);
    expect(advantages.length).toBe(NEXTJOB_STEPS.length);
    expect(screen.getByText(/3 min \/ application/i)).toBeInTheDocument();
  });

  it('supports custom id and class overrides', () => {
    const { container } = render(
      <BeforeAfterComparison id="custom-comparison-id" className="custom-class-override" />
    );

    const section = container.querySelector('#custom-comparison-id');
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('custom-class-override');
  });
});
