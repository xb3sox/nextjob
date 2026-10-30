import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  renderEmailTemplate,
  renderOnboardingSeries,
  renderReengagementSeries,
  renderWelcomeSeries,
  sanitizeUrl,
} from './index';

describe('Email Templates Generator (T-87, FR-CONT-05)', () => {
  const vars = {
    candidateName: 'Alex',
    actionUrl: 'https://nextjob.ai/app',
    matchCount: 12,
    unsubscribeUrl: 'https://nextjob.ai/unsubscribe?token=xyz',
  };

  it('renders Welcome Series emails (W1, W2, W3) with unsubscribe footer', () => {
    const w1 = renderWelcomeSeries(1, vars);
    expect(w1.id).toBe('welcome-w1');
    expect(w1.subject).toContain('Welcome to NextJob');
    expect(w1.text).toContain('Hi Alex');
    expect(w1.html).toContain('https://nextjob.ai/app');
    expect(w1.text).toContain('To manage preferences or unsubscribe');
    expect(w1.html).toContain('Unsubscribe or manage preferences');
    expect(w1.html).toContain('https://nextjob.ai/unsubscribe?token=xyz');
    expect(w1.html).toContain('NextJob Inc.');

    const w2 = renderWelcomeSeries(2, vars);
    expect(w2.id).toBe('welcome-w2');
    expect(w2.subject).toContain('Verify your claims');

    const w3 = renderWelcomeSeries(3, vars);
    expect(w3.id).toBe('welcome-w3');
    expect(w3.text).toContain('12 eligible roles');
  });

  it('renders Onboarding Series emails (O1..O5) with CAN-SPAM compliant footers', () => {
    for (let step = 1; step <= 5; step++) {
      const email = renderOnboardingSeries(step as 1 | 2 | 3 | 4 | 5, vars);
      expect(email.sequence).toBe('onboarding');
      expect(email.step).toBe(step);
      expect(email.html).toContain(vars.actionUrl);
      expect(email.html).toContain('Unsubscribe or manage preferences');
      expect(email.text).toContain('NextJob Inc. · 548 Market St');
    }
  });

  it('renders Re-engagement Series email (R1)', () => {
    const r1 = renderReengagementSeries(1, vars);
    expect(r1.id).toBe('re-engagement-r1');
    expect(r1.subject).toContain('12 new job matches');
    expect(r1.ctaText).toBe('Explore new matches');
    expect(r1.html).toContain('Unsubscribe or manage preferences');
  });

  it('escapes dynamic candidateName to prevent HTML injection', () => {
    const maliciousVars = {
      candidateName: '<script>alert("xss")</script>',
      actionUrl: 'https://nextjob.ai/app',
    };

    const email = renderWelcomeSeries(1, maliciousVars);
    expect(email.html).not.toContain('<script>');
    expect(email.html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('sanitizes unsafe javascript: actionUrls', () => {
    const maliciousVars = {
      candidateName: 'Alex',
      actionUrl: 'javascript:alert(1)',
    };

    const email = renderWelcomeSeries(1, maliciousVars);
    expect(email.html).not.toContain('href="javascript:alert(1)"');
    expect(email.html).toContain('href="#"');
  });

  it('renders via unified renderEmailTemplate dispatcher', () => {
    const email = renderEmailTemplate('welcome', 1, vars);
    expect(email.id).toBe('welcome-w1');
  });

  it('unit tests escapeHtml and sanitizeUrl helpers', () => {
    expect(escapeHtml('A & B < C > "D" \'E\'')).toBe(
      'A &amp; B &lt; C &gt; &quot;D&quot; &#39;E&#39;'
    );
    expect(sanitizeUrl('https://valid.com')).toBe('https://valid.com');
    expect(sanitizeUrl('data:text/html,...')).toBe('#');
  });
});
