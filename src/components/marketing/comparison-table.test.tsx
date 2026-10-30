import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { COMPARISON_DATA, ComparisonTable } from './comparison-table';

describe('ComparisonTable (T-75, FR-CRO-10)', () => {
  it('renders table with proper accessibility landmarks and scope attributes', () => {
    render(<ComparisonTable />);

    // Table container and caption
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    expect(
      screen.getByText('Comparison between NextJob, Manual Job Search, and Generic AI Tools')
    ).toBeInTheDocument();

    // Column headers
    expect(screen.getByRole('columnheader', { name: /Capability/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /NextJob/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Manual Search/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Generic AI Tools/i })).toBeInTheDocument();

    // Row headers
    const rowheaders = screen.getAllByRole('rowheader');
    expect(rowheaders.length).toBe(COMPARISON_DATA.length);
  });

  it('renders all comparison capabilities accurately', () => {
    render(<ComparisonTable />);

    for (const row of COMPARISON_DATA) {
      expect(screen.getByText(row.feature)).toBeInTheDocument();
      expect(screen.getByText(row.nextjob.label)).toBeInTheDocument();
    }
  });

  it('contains zero competitor brand names (FR-CRO-10)', () => {
    const { container } = render(<ComparisonTable />);
    const text = container.textContent?.toLowerCase() || '';

    // Verify competitor names are never mentioned
    const forbiddenCompetitors = [
      'simplify',
      'sonara',
      'lazyapply',
      'teal',
      'jobscan',
      'huntr',
      'rezi',
      'massive',
      'loopcv',
    ];

    for (const competitor of forbiddenCompetitors) {
      expect(text).not.toContain(competitor);
    }
  });

  it('provides screen reader indicators for status icons', () => {
    render(<ComparisonTable />);

    const supportedList = screen.getAllByText('Supported:');
    expect(supportedList.length).toBeGreaterThanOrEqual(1);

    const notSupportedList = screen.getAllByText('Not supported:');
    expect(notSupportedList.length).toBeGreaterThanOrEqual(1);
  });
});
