import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_INTEGRATION_LOGOS, IntegrationLogos } from './integration-logos';

describe('IntegrationLogos (T-92, FR-TRUST-05)', () => {
  it('renders default heading, subheading, and all supported ATS integration logos', () => {
    render(<IntegrationLogos />);

    expect(
      screen.getByRole('heading', {
        name: /supported ats integrations/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/nextjob connects natively with major applicant tracking systems/i)
    ).toBeInTheDocument();

    const supportedItems = DEFAULT_INTEGRATION_LOGOS.filter((item) => item.status === 'supported');
    expect(supportedItems.map((i) => i.name)).toEqual(['Greenhouse', 'Lever', 'Workday', 'iCIMS']);

    for (const item of supportedItems) {
      const img = screen.getByAltText(`${item.name} logo`);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', item.logoUrl);
      expect(img.className).toContain('grayscale');
    }
  });

  it('renders coming soon indicators clearly for planned integrations', () => {
    render(<IntegrationLogos />);

    const comingSoonItems = DEFAULT_INTEGRATION_LOGOS.filter(
      (item) => item.status === 'coming_soon'
    );
    expect(comingSoonItems.map((i) => i.name)).toEqual([
      'Ashby',
      'BambooHR',
      'SmartRecruiters',
      'Workable',
    ]);

    expect(screen.getByText('Planned Integrations (Coming Soon)')).toBeInTheDocument();

    for (const item of comingSoonItems) {
      const img = screen.getByAltText(`${item.name} logo`);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', item.logoUrl);

      const card = screen.getByLabelText(`${item.name} integration - Coming soon`);
      expect(card).toBeInTheDocument();
    }
  });

  it('renders supported notice badge', () => {
    render(
      <IntegrationLogos supportedNotice="Connectors execute strictly with user consent and evidence-backed claims" />
    );

    expect(
      screen.getByText('Connectors execute strictly with user consent and evidence-backed claims')
    ).toBeInTheDocument();
  });

  it('renders custom heading, subheading, and custom integration items', () => {
    const customIntegrations = [
      {
        name: 'Custom ATS',
        logoUrl: '/images/integrations/custom.svg',
        status: 'supported' as const,
        statusLabel: 'Active connector',
        description: 'Custom integration description',
      },
      {
        name: 'Future ATS',
        logoUrl: '/images/integrations/future.svg',
        status: 'coming_soon' as const,
        statusLabel: 'Coming soon',
        description: 'Future integration description',
      },
    ];

    render(
      <IntegrationLogos
        heading="Custom ATS Heading"
        subheading="Custom ATS Subheading"
        integrations={customIntegrations}
      />
    );

    expect(screen.getByRole('heading', { name: 'Custom ATS Heading' })).toBeInTheDocument();
    expect(screen.getByText('Custom ATS Subheading')).toBeInTheDocument();
    expect(screen.getByAltText('Custom ATS logo')).toBeInTheDocument();
    expect(screen.getByAltText('Future ATS logo')).toBeInTheDocument();
  });

  it('has accessible section landmark and responsive grid structure', () => {
    const { container } = render(<IntegrationLogos />);

    const section = screen.getByRole('region', { name: /ats integrations/i });
    expect(section).toBeInTheDocument();

    const grids = container.querySelectorAll('.grid');
    expect(grids.length).toBeGreaterThanOrEqual(2);

    for (const grid of Array.from(grids)) {
      expect(grid.className).toContain('grid-cols-2');
      expect(grid.className).toContain('md:grid-cols-4');
    }
  });
});
