import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from '@/components/ProtectedRoute';

// Stub the auth context so the guard can be tested without Supabase.
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';

const mockUseAuth = vi.mocked(useAuth);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ status: 'authenticated' } as ReturnType<typeof useAuth>);
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div data-testid="secret">content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('secret')).toBeInTheDocument();
  });

  it('shows a loading state while the session is being resolved', () => {
    mockUseAuth.mockReturnValue({ status: 'loading' } as ReturnType<typeof useAuth>);
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div data-testid="secret">content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByTestId('secret')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('does not render children when unauthenticated', () => {
    mockUseAuth.mockReturnValue({ status: 'unauthenticated' } as ReturnType<typeof useAuth>);
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div data-testid="secret">content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div data-testid="login">login</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.queryByTestId('secret')).not.toBeInTheDocument();
    expect(screen.getByTestId('login')).toBeInTheDocument();
  });
});
