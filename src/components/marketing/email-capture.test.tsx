import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { newsletterStore } from '../../pages/api/newsletter/route';
import { EmailCapture } from './email-capture';

describe('EmailCapture Component (T-100, FR-GROW-01)', () => {
  beforeEach(() => {
    newsletterStore.clear();
    vi.clearAllMocks();
  });

  it('renders default footer variant with title, description, input and GDPR checkbox', () => {
    render(<EmailCapture variant="footer" />);

    expect(screen.getByText(/Subscribe to Career Engineering/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@company.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Subscribe/i })).toBeInTheDocument();
    expect(
      screen.getByLabelText(/I agree to receive emails and accept the GDPR data processing policy/i)
    ).toBeInTheDocument();
  });

  it('renders lead_magnet variant with custom title and button text', () => {
    render(
      <EmailCapture
        variant="lead_magnet"
        title="Custom Lead Magnet Title"
        buttonText="Claim Download"
      />
    );

    expect(screen.getByText(/Custom Lead Magnet Title/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Claim Download/i })).toBeInTheDocument();
  });

  it('displays error message when submitted without email', async () => {
    render(<EmailCapture />);

    const submitBtn = screen.getByRole('button', { name: /Subscribe/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Please enter your email address/i);
  });

  it('displays error message when submitted with invalid email format', async () => {
    render(<EmailCapture />);

    const input = screen.getByPlaceholderText(/you@company.com/i);
    fireEvent.change(input, { target: { value: 'invalid-email' } });

    const submitBtn = screen.getByRole('button', { name: /Subscribe/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Please enter a valid email address/i
    );
  });

  it('displays error message when submitted without GDPR consent checkbox', async () => {
    render(<EmailCapture />);

    const input = screen.getByPlaceholderText(/you@company.com/i);
    fireEvent.change(input, { target: { value: 'user@example.com' } });

    const submitBtn = screen.getByRole('button', { name: /Subscribe/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Please confirm your consent to receive emails/i
    );
  });

  it('submits successfully when valid email and consent are provided', async () => {
    const onSuccess = vi.fn();
    render(<EmailCapture onSuccess={onSuccess} source="footer" />);

    const input = screen.getByPlaceholderText(/you@company.com/i);
    fireEvent.change(input, { target: { value: 'subscriber@verified.org' } });

    const checkbox = screen.getByLabelText(/I agree to receive emails/i);
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: /Subscribe/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/You're subscribed!/i);
    });

    expect(onSuccess).toHaveBeenCalledWith('subscriber@verified.org');

    // Check store for stored email and consent
    const stored = newsletterStore.getSubscriber('subscriber@verified.org');
    expect(stored).toBeDefined();
    expect(stored?.email).toBe('subscriber@verified.org');
    expect(stored?.consent).toBe(true);
    expect(stored?.source).toBe('footer');
  });
});
