import { describe, expect, it } from 'vitest';
import {
  renderEmailTemplate,
  renderOnboardingSeries,
  renderReengagementSeries,
  renderWelcomeSeries,
} from './index';

describe('Email Templates Generator', () => {
  const vars = {
    candidateName: 'Alex',
    actionUrl: 'https://nextjob.ai/app',
    matchCount: 12,
  };

  it('renders Welcome Series emails (W1, W2, W3)', () => {
    const w1 = renderWelcomeSeries(1, vars);
    expect(w1.id).toBe('welcome-w1');
    expect(w1.subject).toContain('Welcome to NextJob');
    expect(w1.text).toContain('Hi Alex');
    expect(w1.html).toContain('https://nextjob.ai/app');

    const w2 = renderWelcomeSeries(2, vars);
    expect(w2.id).toBe('welcome-w2');
    expect(w2.subject).toContain('Verify your claims');

    const w3 = renderWelcomeSeries(3, vars);
    expect(w3.id).toBe('welcome-w3');
    expect(w3.text).toContain('12 eligible roles');
  });

  it('renders Onboarding Series emails (O1..O5)', () => {
    for (let step = 1; step <= 5; step++) {
      const email = renderOnboardingSeries(step as 1 | 2 | 3 | 4 | 5, vars);
      expect(email.sequence).toBe('onboarding');
      expect(email.step).toBe(step);
      expect(email.html).toContain(vars.actionUrl);
    }
  });

  it('renders Re-engagement Series email (R1)', () => {
    const r1 = renderReengagementSeries(1, vars);
    expect(r1.id).toBe('re-engagement-r1');
    expect(r1.subject).toContain('12 new job matches');
    expect(r1.ctaText).toBe('Explore new matches');
  });

  it('renders via unified renderEmailTemplate dispatcher', () => {
    const email = renderEmailTemplate('welcome', 1, vars);
    expect(email.id).toBe('welcome-w1');
  });
});
