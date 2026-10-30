/**
 * @vitest-environment happy-dom
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReferralCard } from './ReferralCard';

describe('ReferralCard Component (T-56, FR-MKT-10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders referral heading, value proposition, and unique link', () => {
    render(
      <ReferralCard
        referralCode="REF-ALICE1"
        referralUrl="https://nextjob.ai/?ref=REF-ALICE1"
        stats={{ clicks: 12, successfulSignups: 3, rewardCreditsEarned: 30 }}
      />
    );

    expect(screen.getByText('Refer Friends & Earn Credits')).toBeDefined();
    expect(screen.getByText(/Give candidates \$10 off their Search Pass/)).toBeDefined();
    expect(screen.getByDisplayValue('https://nextjob.ai/?ref=REF-ALICE1')).toBeDefined();
  });

  it('displays accurate referral statistics', () => {
    render(
      <ReferralCard
        referralCode="REF-BOB222"
        referralUrl="https://nextjob.ai/?ref=REF-BOB222"
        stats={{ clicks: 45, successfulSignups: 4, rewardCreditsEarned: 40 }}
      />
    );

    expect(screen.getByTestId('stat-clicks').textContent).toBe('45');
    expect(screen.getByTestId('stat-signups').textContent).toBe('4');
    expect(screen.getByTestId('stat-rewards').textContent).toBe('$40');
  });

  it('copies referral link to clipboard and shows success state', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    render(
      <ReferralCard referralCode="REF-ALICE1" referralUrl="https://nextjob.ai/?ref=REF-ALICE1" />
    );

    const copyBtn = screen.getByRole('button', { name: /copy referral link/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('https://nextjob.ai/?ref=REF-ALICE1');
    expect(await screen.findByText('Copied!')).toBeDefined();
  });

  it('provides accessible labels and polite live regions for screen readers', () => {
    render(
      <ReferralCard referralCode="REF-ACC001" referralUrl="https://nextjob.ai/?ref=REF-ACC001" />
    );

    expect(screen.getByLabelText(/your unique referral link/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /copy referral link/i })).toBeDefined();
  });
});
