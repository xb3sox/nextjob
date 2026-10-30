/**
 * @vitest-environment happy-dom
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import CohortReportPage, { MINIMUM_COHORT_SIZE } from './CohortReportPage';

describe('CohortReportPage (T-31, FR-09, G-10)', () => {
  const renderWithRouter = (initialRoute = '/organizations/tech-uni/reports') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/organizations/:id/reports" element={<CohortReportPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders aggregate performance metrics for compliant cohort (>= 5 participants)', () => {
    renderWithRouter();

    // Compliant cohort (12 participants)
    expect(screen.getByText('Cohort Aggregate Performance')).toBeInTheDocument();
    expect(screen.getByTestId('aggregate-metrics-container')).toBeInTheDocument();

    expect(screen.getByText('12')).toBeInTheDocument(); // Cohort Size
    expect(screen.getByText('144')).toBeInTheDocument(); // Applications Sent
    expect(screen.getByText('32%')).toBeInTheDocument(); // Interview Rate
    expect(screen.getByText('42%')).toBeInTheDocument(); // Offer Rate
    expect(screen.getByText(/FR-09 & G-10 Compliant/i)).toBeInTheDocument();

    // Verify privacy notice is shown
    expect(screen.getByText(/Privacy Notice \(FR-09\)/i)).toBeInTheDocument();

    // Verify no individual student records or PII exist
    expect(screen.queryByText(/alice/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/student@/i)).not.toBeInTheDocument();
  });

  it('shields reporting and shows alert when cohort has fewer than 5 participants (G-10)', () => {
    renderWithRouter();

    // Switch to small cohort (4 participants)
    const select = screen.getByLabelText(/select cohort/i);
    fireEvent.change(select, { target: { value: 'cohort-small' } });

    // Must show alert and lock message
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(/Aggregate Reporting Shielded \(G-10\)/i);
    expect(alert).toHaveTextContent(
      new RegExp(`at least ${MINIMUM_COHORT_SIZE} participants`, 'i')
    );

    // Metrics container must NOT be in the document
    expect(screen.queryByTestId('aggregate-metrics-container')).not.toBeInTheDocument();
  });
});
