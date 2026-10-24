import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import WaitlistForm from './WaitlistForm';

describe('WaitlistForm', () => {
  it('renders the email input and submit button', () => {
    render(<WaitlistForm />);
    expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start free/i })).toBeInTheDocument();
  });

  it('shows an error when submitting an empty email', async () => {
    const user = userEvent.setup();
    render(<WaitlistForm />);

    await user.click(screen.getByRole('button', { name: /start free/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Please enter your email address.');
    expect(screen.getByLabelText('Email address')).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows an error for an invalid email', async () => {
    const user = userEvent.setup();
    render(<WaitlistForm />);

    await user.type(screen.getByLabelText('Email address'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /start free/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i);
  });

  it('clears the error once the user edits the field', async () => {
    const user = userEvent.setup();
    render(<WaitlistForm />);

    await user.click(screen.getByRole('button', { name: /start free/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Email address'), 'a@b.co');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('walks through loading and success states on a valid email', async () => {
    const user = userEvent.setup();
    render(<WaitlistForm />);

    await user.type(screen.getByLabelText('Email address'), 'sam@example.com');
    await user.click(screen.getByRole('button', { name: /start free/i }));

    // Loading state: button is disabled while the (simulated) request runs.
    expect(await screen.findByRole('button', { name: /joining/i })).toBeDisabled();

    // Success state surfaces in a live region; form locks to prevent double-join.
    await waitFor(
      () => {
        expect(screen.getByRole('status')).toHaveTextContent(/on the list/i);
      },
      { timeout: 4000 }
    );
    expect(screen.getByRole('button', { name: /joined/i })).toBeDisabled();
    expect(screen.getByLabelText('Email address')).toBeDisabled();
  });
});
