/**
 * @vitest-environment happy-dom
 */

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import DataHandlingPage from './DataHandlingPage';

describe('DataHandlingPage (T-90, FR-TRUST-03)', () => {
  it('renders header, title, and FR-TRUST-03 badge', () => {
    render(
      <MemoryRouter>
        <DataHandlingPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Data Handling & Transparency Manifesto')).toBeInTheDocument();
    expect(screen.getByText(/FR-TRUST-03 Data Handling Transparency/i)).toBeInTheDocument();
    expect(screen.getByText('NextJob Transparency')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Home/i })).toBeInTheDocument();
  });

  it('displays collection boundaries including what is collected and what is never collected', () => {
    render(
      <MemoryRouter>
        <DataHandlingPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/1\. What Data We Collect \(and What We Never Collect\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText('What We Collect')).toBeInTheDocument();
    expect(screen.getByText('What We Never Collect')).toBeInTheDocument();
    expect(
      screen.getByText(/No biometric identifiers or facial recognition data/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No sensitive medical, health, or disability records/i)
    ).toBeInTheDocument();
  });

  it('documents AI usage constraints, evidence provenance, and zero hallucination rule', () => {
    render(
      <MemoryRouter>
        <DataHandlingPage />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/2\. How Your Career Data Is Used \(Zero Hallucination Constraint\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText('PII Redaction')).toBeInTheDocument();
    expect(screen.getByText('No Public Model Training')).toBeInTheDocument();
    expect(screen.getByText('Audited Precedence')).toBeInTheDocument();
  });

  it('details retention schedules, cascading hard deletion, and zero data sales guarantee', () => {
    render(
      <MemoryRouter>
        <DataHandlingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/3\. Retention Schedules & Storage Durations/i)).toBeInTheDocument();
    expect(screen.getByText('Uploaded CVs & Evidence')).toBeInTheDocument();
    expect(screen.getByText('Submission Receipts')).toBeInTheDocument();

    expect(
      screen.getByText(/4\. Cascading Hard Deletion Process \(No Ghost Records\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/5\. Zero Data Sales Guarantee/i)).toBeInTheDocument();
    expect(
      screen.getByText(/NextJob has never sold, rented, leased, or brokered personal data/i)
    ).toBeInTheDocument();
  });

  it('provides navigation links to Privacy Policy and Terms of Service', () => {
    render(
      <MemoryRouter>
        <DataHandlingPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute(
      'href',
      '/privacy'
    );
    expect(screen.getByRole('link', { name: /Terms of Service/i })).toHaveAttribute(
      'href',
      '/terms'
    );
  });
});
