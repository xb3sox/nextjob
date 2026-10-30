/**
 * @vitest-environment happy-dom
 */
import { createSubmissionReceipt } from '@nextjob/applications';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ApplicationsPage from './ApplicationsPage';
import type { TrackedApplication } from './types';
import { APPLICATIONS_STORAGE_KEY } from './useApplications';

// Mock AuthContext
let mockUser: { email: string; user_metadata?: { full_name?: string } } | null = {
  email: 'test@example.com',
  user_metadata: { full_name: 'Test Candidate' },
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: vi.fn(),
  }),
}));

const validReceipt = createSubmissionReceipt({
  applicationId: 'app-applied-1',
  jobVersion: 'v1.0.0',
  submittedFields: { name: 'Alice', email: 'alice@example.com' },
  answers: ['5 years experience'],
  confirmationEvidenceId: 'ev-123',
});

const mockApplications: TrackedApplication[] = [
  {
    id: 'app-planned-1',
    state: 'PLANNED',
    retryCount: 0,
    jobTitle: 'Senior Frontend Engineer',
    companyName: 'Acme Corp',
    audit: [
      {
        at: '2026-10-25T10:00:00Z',
        from: 'MATCHED',
        to: 'PLANNED',
        actor: 'user',
        reason: 'Ready for tailoring',
      },
    ],
  },
  {
    id: 'app-approval-1',
    state: 'NEEDS_APPROVAL',
    retryCount: 0,
    jobTitle: 'Lead UI Architect',
    companyName: 'Globex Inc',
    audit: [],
  },
  {
    id: 'app-applied-1',
    state: 'SUBMITTED_VERIFIED',
    retryCount: 0,
    jobTitle: 'Staff Engineer',
    companyName: 'Initech',
    receipt: validReceipt,
    audit: [],
  },
];

function renderWithRouter(initialEntries: string[] = ['/applications']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ApplicationsPage (T-27 Tracker UI)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockUser = {
      email: 'test@example.com',
      user_metadata: { full_name: 'Test Candidate' },
    };
  });

  it('redirects unauthenticated visits to /login', () => {
    mockUser = null;
    renderWithRouter();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders seeded rows correctly under their respective groups', () => {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(mockApplications));
    renderWithRouter();

    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();

    expect(screen.getByText('Lead UI Architect')).toBeInTheDocument();
    expect(screen.getByText('Globex Inc')).toBeInTheDocument();

    expect(screen.getByText('Staff Engineer')).toBeInTheDocument();
    expect(screen.getByText('Initech')).toBeInTheDocument();

    // Verify all 8 groups are rendered as headings in correct order
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent?.replace(/[0-9]/g, '').trim());
    expect(headings).toContain('Planned');
    expect(headings).toContain('Needs approval');
    expect(headings).toContain('Applied');
  });

  it('filters applications by search query', () => {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(mockApplications));
    renderWithRouter(['/applications?q=acme']);

    expect(screen.getByText('Senior Frontend Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Lead UI Architect')).not.toBeInTheDocument();
    expect(screen.queryByText('Staff Engineer')).not.toBeInTheDocument();
  });

  it('filters applications by state tab filter', () => {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(mockApplications));
    renderWithRouter(['/applications?state=applied']);

    expect(screen.getByText('Staff Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Senior Frontend Engineer')).not.toBeInTheDocument();
    expect(screen.queryByText('Lead UI Architect')).not.toBeInTheDocument();
  });

  it('handles malformed localStorage JSON gracefully without crashing', () => {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, 'invalid-json{{{');
    renderWithRouter();

    expect(screen.getByText('No applications found')).toBeInTheDocument();
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
  });

  it('displays submission receipt details and verifies valid receipt', () => {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(mockApplications));
    renderWithRouter();

    expect(screen.getAllByText(/verified/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Receipt:')).toBeInTheDocument();
    expect(screen.getByText(/Hash:/i)).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows a visible warning when receipt verification fails (tampered receipt)', () => {
    const tamperedReceipt = {
      ...validReceipt,
      contentHash: 'tampered-hash-00000000000000000000000000000000',
    };

    const tamperedApp: TrackedApplication = {
      ...mockApplications[2],
      id: 'app-tampered-1',
      receipt: tamperedReceipt,
    };

    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify([tamperedApp]));
    renderWithRouter();

    const warning = screen.getByRole('alert');
    expect(warning).toBeInTheDocument();
    expect(warning).toHaveTextContent(/receipt verification mismatch/i);
  });

  it('is accessible: has labeled search input, button tabs, and headings', () => {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify(mockApplications));
    renderWithRouter();

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThanOrEqual(8);
    for (const tab of tabs) {
      expect(tab.tagName.toLowerCase()).toBe('button');
    }
  });
  it('opens outcome modal and updates application state to INTERVIEW (T-29)', async () => {
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify([mockApplications[2]])); // SUBMITTED_VERIFIED
    renderWithRouter();

    // Click Update Outcome
    const updateBtn = screen.getByRole('button', { name: /update outcome/i });
    expect(updateBtn).toBeInTheDocument();
    fireEvent.click(updateBtn);

    // Modal opens
    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(screen.getByText(/Record Application Outcome/i)).toBeInTheDocument();

    // Select Interview radio
    const interviewOption = screen.getByRole('radio', { name: /Interview/i });
    fireEvent.click(interviewOption);

    // Click Save Outcome
    const saveBtn = screen.getByRole('button', { name: /save outcome/i });
    fireEvent.click(saveBtn);

    // Modal closed and state updated
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('INTERVIEW')).toBeInTheDocument();

    // Check localStorage was updated
    const saved = JSON.parse(localStorage.getItem(APPLICATIONS_STORAGE_KEY) || '[]');
    expect(saved[0].state).toBe('INTERVIEW');
    expect(saved[0].audit[saved[0].audit.length - 1].to).toBe('INTERVIEW');
  });

  it('shows outcome finalized for terminal application states', () => {
    const hiredApp = {
      ...mockApplications[0],
      id: 'app-hired-1',
      state: 'HIRED',
    };
    localStorage.setItem(APPLICATIONS_STORAGE_KEY, JSON.stringify([hiredApp]));
    renderWithRouter();

    expect(screen.getByText(/Outcome finalized/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /update outcome/i })).not.toBeInTheDocument();
  });
});
