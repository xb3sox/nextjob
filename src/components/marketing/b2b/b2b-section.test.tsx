import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { B2BSection } from './b2b-section';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('B2BSection (T-53, FR-MKT-08, AC-16)', () => {
  it('renders section title, value pillars, and privacy safeguards', () => {
    renderWithRouter(<B2BSection />);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /elevate cohort outcomes\. zero surveillance\./i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText('Cohort Management')).toBeInTheDocument();
    expect(screen.getByText('Privacy Safeguards (G-10 & FR-09)')).toBeInTheDocument();
    expect(screen.getByText('Aggregate ROI Analytics')).toBeInTheDocument();
    expect(screen.getByText('Transparent Institutional Plans')).toBeInTheDocument();
  });

  it('renders interactive privacy simulation toggle and switches between compliant and shielded views', () => {
    renderWithRouter(<B2BSection />);

    const compliantTab = screen.getByRole('tab', {
      name: /compliant cohort \(n = 12\)/i,
    });
    const shieldedTab = screen.getByRole('tab', {
      name: /sub-threshold \(n = 4\)/i,
    });

    expect(compliantTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('b2b-compliant-view')).toBeInTheDocument();
    expect(screen.getByText('144')).toBeInTheDocument();
    expect(screen.getByText('32%')).toBeInTheDocument();

    // Click shielded tab
    fireEvent.click(shieldedTab);

    expect(shieldedTab).toHaveAttribute('aria-selected', 'true');
    expect(compliantTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByTestId('b2b-shielded-view')).toBeInTheDocument();
    expect(screen.getByText(/aggregate reporting shielded \(threshold < 5\)/i)).toBeInTheDocument();
    expect(screen.getByText(/active participants: 4 \/ 5 required/i)).toBeInTheDocument();

    // Click compliant tab again
    fireEvent.click(compliantTab);
    expect(screen.getByTestId('b2b-compliant-view')).toBeInTheDocument();
  });

  it('handles demo request form submission and shows success confirmation', () => {
    renderWithRouter(<B2BSection />);

    const nameInput = screen.getByLabelText(/institution or bootcamp name/i);
    const emailInput = screen.getByLabelText(/work email/i);
    const sizeSelect = screen.getByLabelText(/expected active seekers per cohort/i);
    const submitBtn = screen.getByRole('button', {
      name: /request institutional demo/i,
    });

    fireEvent.change(nameInput, { target: { value: 'Horizon Tech Institute' } });
    fireEvent.change(emailInput, { target: { value: 'partnerships@horizon.edu' } });
    fireEvent.change(sizeSelect, { target: { value: '50-150' } });

    fireEvent.click(submitBtn);

    // Verify success confirmation
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/demo request received/i)).toBeInTheDocument();
    expect(screen.getByText('Horizon Tech Institute')).toBeInTheDocument();
    expect(screen.getByText('partnerships@horizon.edu')).toBeInTheDocument();

    const reportLink = screen.getByRole('link', {
      name: /explore interactive sample cohort report/i,
    });
    expect(reportLink).toHaveAttribute('href', '/organizations/cohort-compliant/reports');
  });

  it('renders institutional pricing tiers and quote', () => {
    renderWithRouter(<B2BSection />);

    expect(screen.getByText('Pilot Cohort')).toBeInTheDocument();
    expect(screen.getByText('$490')).toBeInTheDocument();
    expect(screen.getByText('Career Accelerator')).toBeInTheDocument();
    expect(screen.getByText('$1,800')).toBeInTheDocument();
    expect(
      screen.getByText(/nextjob doubled our bootcamp's 90-day placement rate/i)
    ).toBeInTheDocument();
  });
});
