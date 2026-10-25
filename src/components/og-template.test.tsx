import { describe, expect, it } from 'vitest';
import { renderOGImageSVG } from './og-template';

describe('OGTemplate', () => {
  it('renders standard 1200x630 dimensions with SVG elements', () => {
    const svg = renderOGImageSVG();
    expect(svg).toContain('width="1200"');
    expect(svg).toContain('height="630"');
    expect(svg).toContain('viewBox="0 0 1200 630"');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('renders NextJob default branding elements', () => {
    const svg = renderOGImageSVG();
    expect(svg).toContain('NextJob');
    expect(svg).toContain('#0a0a0a'); // Dark background
    expect(svg).toContain('#34d399'); // Moss accent color
    expect(svg).toContain('Apply to jobs with proof, not promises.');
  });

  it('renders custom titles and descriptions', () => {
    const svg = renderOGImageSVG({
      title: 'Tailored Resume Generator',
      description: 'Generate evidence-backed resume variants for target roles.',
      badge: 'FEATURE',
    });

    expect(svg).toContain('Tailored Resume Generator');
    expect(svg).toContain('Generate evidence-backed resume variants');
    expect(svg).toContain('FEATURE');
  });

  it('generates unique OG images for different pages', () => {
    const homeSvg = renderOGImageSVG({ pageType: 'home' });
    const tailorSvg = renderOGImageSVG({
      pageType: 'tailor',
      title: 'Tailor Applications',
      description: 'Evidence-constrained AI application generator',
    });
    const privacySvg = renderOGImageSVG({
      pageType: 'privacy',
      title: 'Privacy Policy',
      description: 'Your data stays yours with end-to-end encryption',
    });

    expect(homeSvg).not.toEqual(tailorSvg);
    expect(tailorSvg).not.toEqual(privacySvg);
    expect(homeSvg).not.toEqual(privacySvg);

    expect(homeSvg).toContain('PRIVATE BETA');
    expect(tailorSvg).toContain('EVIDENCE TAILORING');
    expect(privacySvg).toContain('LEGAL &amp; COMPLIANCE');
  });

  it('renders in < 200ms (satisfies < 2s criteria)', () => {
    const start = performance.now();
    for (let i = 0; i < 10; i++) {
      renderOGImageSVG({
        title: `Dynamic Page ${i}`,
        description: `Unique description for page number ${i}`,
        pageType: 'job',
      });
    }
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(2000); // 2 seconds threshold
  });
});
