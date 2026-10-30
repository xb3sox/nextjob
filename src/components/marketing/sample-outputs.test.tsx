import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SampleOutputs } from './sample-outputs';

describe('SampleOutputs (T-91, FR-TRUST-04)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders section heading and privacy redaction banner', () => {
    render(<SampleOutputs />);

    expect(
      screen.getByRole('heading', { level: 2, name: /real sample outputs, 100% redacted/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/100% pii & sensitive data redacted/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy guaranteed/i)).toBeInTheDocument();
  });

  it('renders tab list with accessible ARIA roles and handles tab switching', () => {
    render(<SampleOutputs />);

    const tablist = screen.getByRole('tablist', { name: /sample output category navigation/i });
    expect(tablist).toBeInTheDocument();

    const receiptsTab = screen.getByRole('tab', { name: /submission receipts/i });
    const resumeTab = screen.getByRole('tab', { name: /tailored resume snippets/i });
    const coverLetterTab = screen.getByRole('tab', { name: /cover letter examples/i });

    expect(receiptsTab).toHaveAttribute('aria-selected', 'true');
    expect(resumeTab).toHaveAttribute('aria-selected', 'false');
    expect(coverLetterTab).toHaveAttribute('aria-selected', 'false');

    // Default panel: Receipts
    expect(
      screen.getByRole('heading', { level: 3, name: /verified submission receipt output/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/STATUS: SUBMITTED_VERIFIED/i)).toBeInTheDocument();
    expect(screen.getByText(/\[REDACTED_CANDIDATE_NAME\]/i)).toBeInTheDocument();

    // Click Tailored Resume Snippets tab
    fireEvent.click(resumeTab);
    expect(resumeTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('heading', { level: 3, name: /evidence-constrained resume tailoring/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/100% truthful provenance verified/i)).toBeInTheDocument();

    // Click Cover Letter Examples tab
    fireEvent.click(coverLetterTab);
    expect(coverLetterTab).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('heading', { level: 3, name: /grounded cover letter output example/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/0 unsupported statements/i)).toBeInTheDocument();
  });

  it('supports keyboard navigation between category tabs', () => {
    render(<SampleOutputs />);

    const receiptsTab = screen.getByRole('tab', { name: /submission receipts/i });
    const resumeTab = screen.getByRole('tab', { name: /tailored resume snippets/i });
    const coverLetterTab = screen.getByRole('tab', { name: /cover letter examples/i });

    receiptsTab.focus();

    // Press ArrowRight -> moves to Resume tab
    fireEvent.keyDown(receiptsTab, { key: 'ArrowRight' });
    expect(resumeTab).toHaveAttribute('aria-selected', 'true');

    // Press ArrowRight -> moves to Cover Letter tab
    fireEvent.keyDown(resumeTab, { key: 'ArrowRight' });
    expect(coverLetterTab).toHaveAttribute('aria-selected', 'true');

    // Press ArrowRight -> wraps back to Receipts tab
    fireEvent.keyDown(coverLetterTab, { key: 'ArrowRight' });
    expect(receiptsTab).toHaveAttribute('aria-selected', 'true');

    // Press ArrowLeft -> wraps to Cover Letter tab
    fireEvent.keyDown(receiptsTab, { key: 'ArrowLeft' });
    expect(coverLetterTab).toHaveAttribute('aria-selected', 'true');
  });

  it('allows selecting different receipt samples and copying the sha256 hash', async () => {
    render(<SampleOutputs />);

    const sample1Btn = screen.getByRole('button', { name: /sample #1/i });
    const sample2Btn = screen.getByRole('button', { name: /sample #2/i });

    expect(sample1Btn).toBeInTheDocument();
    expect(sample2Btn).toBeInTheDocument();

    // Switch to sample #2
    fireEvent.click(sample2Btn);
    expect(screen.getByText(/staff infrastructure architect/i)).toBeInTheDocument();

    // Copy SHA-256 button
    const copyBtn = screen.getByRole('button', { name: /copy sha-256 hash/i });
    expect(copyBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // Advance timers so copy state resets cleanly
    act(() => {
      vi.advanceTimersByTime(2500);
    });
  });
});
