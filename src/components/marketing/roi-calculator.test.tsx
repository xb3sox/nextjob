import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { analytics } from '../../lib/analytics';
import { calculateRoi, RoiCalculator, SEARCH_PRESETS } from './roi-calculator';

vi.mock('../../lib/analytics', () => ({
  analytics: {
    trackCtaClick: vi.fn(),
  },
}));

describe('calculateRoi (T-71, FR-CRO-03)', () => {
  it('accurately computes time saved and callback lift for default values', () => {
    const res = calculateRoi(30, 1.5, 3.0);

    // 30 * 1.5 = 45 hours manual
    expect(res.manualMonthlyHours).toBe(45);
    // 30 * 0.05 = 1.5 hours NextJob
    expect(res.nextJobMonthlyHours).toBe(1.5);
    // 45 - 1.5 = 43.5 -> Math.round -> 44 hours saved
    expect(res.monthlyHoursSaved).toBe(44);
    // (44 * 12) / 8 = 66 days/year saved
    expect(res.yearlyDaysSaved).toBe(66);
    expect(res.timeReductionPercent).toBe(93);

    // 30 * (3.0 / 100) = 0.9 baseline callbacks
    expect(res.currentCallbacks).toBe(0.9);
    // 0.9 * 3.2 = 2.88 -> 2.9 projected
    expect(res.projectedCallbacks).toBe(2.9);
    // 2.9 - 0.9 = 2.0 extra callbacks
    expect(res.extraCallbacks).toBe(2.0);

    expect(res.provenanceScore).toBe(100);
    expect(res.atsPassRate).toBe(99.4);
  });

  it('handles small search intensity without zero or negative outputs', () => {
    const res = calculateRoi(5, 0.5, 1.0);
    expect(res.monthlyHoursSaved).toBeGreaterThanOrEqual(1);
    expect(res.yearlyDaysSaved).toBeGreaterThanOrEqual(1);
    expect(res.extraCallbacks).toBeGreaterThanOrEqual(0.1);
  });
});

describe('RoiCalculator Component (T-71, FR-CRO-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section landmark, title, and initial metrics', () => {
    render(<RoiCalculator />);

    expect(
      screen.getByRole('region', { name: 'Career search ROI calculator' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Calculate Your Career Search ROI' })
    ).toBeInTheDocument();

    // Default 30 applications and 1.5 hours
    expect(screen.getByText('30 / mo')).toBeInTheDocument();
    expect(screen.getByText('1.5 hrs')).toBeInTheDocument();
    expect(screen.getByText('3.0%')).toBeInTheDocument();

    // Verification outcomes
    expect(screen.getByText('44')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByText('100% Provenance')).toBeInTheDocument();
    expect(screen.getByText('99.4% ATS Pass Rate')).toBeInTheDocument();
  });

  it('has accessible slider controls and labels', () => {
    render(<RoiCalculator />);

    const appsSlider = screen.getByLabelText('Monthly Applications');
    expect(appsSlider).toHaveAttribute('type', 'range');
    expect(appsSlider).toHaveAttribute('aria-valuemin', '5');
    expect(appsSlider).toHaveAttribute('aria-valuemax', '100');
    expect(appsSlider).toHaveAttribute('aria-valuenow', '30');

    const hoursSlider = screen.getByLabelText('Hours Spent Per Role (Manual)');
    expect(hoursSlider).toHaveAttribute('aria-valuemin', '0.5');
    expect(hoursSlider).toHaveAttribute('aria-valuemax', '4');

    const callbackSlider = screen.getByLabelText('Current Callback Rate');
    expect(callbackSlider).toHaveAttribute('aria-valuemin', '1');
    expect(callbackSlider).toHaveAttribute('aria-valuemax', '15');
  });

  it('updates calculations when sliders change', () => {
    render(<RoiCalculator />);

    const appsSlider = screen.getByLabelText('Monthly Applications');
    fireEvent.change(appsSlider, { target: { value: '60' } });

    expect(screen.getByText('60 / mo')).toBeInTheDocument();
    // 60 * 1.5 = 90 manual, 60 * 0.05 = 3 NextJob, 90 - 3 = 87 hrs saved
    expect(screen.getByText('87')).toBeInTheDocument();
  });

  it('switches values and highlights button when quick presets are clicked', () => {
    render(<RoiCalculator />);

    const casualButton = screen.getByRole('button', { name: SEARCH_PRESETS[0].label });
    fireEvent.click(casualButton);

    expect(screen.getByText('10 / mo')).toBeInTheDocument();
    expect(screen.getByText('1.0 hrs')).toBeInTheDocument();

    const aggressiveButton = screen.getByRole('button', { name: SEARCH_PRESETS[2].label });
    fireEvent.click(aggressiveButton);

    expect(screen.getByText('60 / mo')).toBeInTheDocument();
    expect(screen.getByText('2.0 hrs')).toBeInTheDocument();
  });

  it('fires analytics tracking and optional callback on CTA click', () => {
    const onCtaClick = vi.fn();
    render(<RoiCalculator onCtaClick={onCtaClick} ctaHref="/custom-signup" />);

    const ctaButton = screen.getByRole('link', { name: /Get Started Free/i });
    expect(ctaButton).toHaveAttribute('href', '/custom-signup');

    fireEvent.click(ctaButton);

    expect(analytics.trackCtaClick).toHaveBeenCalledWith('roi_calculator', '/custom-signup');
    expect(onCtaClick).toHaveBeenCalledTimes(1);
  });
});
