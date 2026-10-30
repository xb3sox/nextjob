import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CustomerLogos, DEFAULT_CUSTOMER_LOGOS } from './customer-logos';

describe('CustomerLogos', () => {
  it('renders heading and default customer logos', () => {
    render(<CustomerLogos />);

    expect(
      screen.getByRole('heading', {
        name: /trusted by candidates hired at leading engineering teams/i,
      })
    ).toBeInTheDocument();

    for (const logo of DEFAULT_CUSTOMER_LOGOS) {
      const img = screen.getByAltText(`${logo.name} logo`);
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', logo.logoUrl);
      expect(img.className).toContain('grayscale');
      expect(img.className).toContain('group-hover:grayscale-0');
    }
  });

  it('renders permission notice', () => {
    render(<CustomerLogos permissionNotice="Logos displayed with verified permission" />);

    expect(screen.getByText('Logos displayed with verified permission')).toBeInTheDocument();
  });

  it('renders custom logos and custom heading/subheading', () => {
    const customLogos = [
      {
        name: 'Acme Corp',
        logoUrl: '/images/logos/acme.svg',
        permissionVerified: true,
        permissionNote: 'Consent received',
      },
    ];

    render(
      <CustomerLogos heading="Custom Heading" subheading="Custom Subheading" logos={customLogos} />
    );

    expect(screen.getByRole('heading', { name: 'Custom Heading' })).toBeInTheDocument();
    expect(screen.getByText('Custom Subheading')).toBeInTheDocument();
    expect(screen.getByAltText('Acme Corp logo')).toBeInTheDocument();
  });

  it('has responsive grid classes and accessible section landmark', () => {
    const { container } = render(<CustomerLogos />);

    const section = screen.getByRole('region', { name: /customer and employer logos/i });
    expect(section).toBeInTheDocument();

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(grid?.className).toContain('grid-cols-2');
    expect(grid?.className).toContain('sm:grid-cols-4');
    expect(grid?.className).toContain('md:grid-cols-8');
  });
});
