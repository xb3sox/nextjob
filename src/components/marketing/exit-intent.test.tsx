import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExitIntentModal } from './exit-intent';

describe('ExitIntentModal Component (T-72, FR-CRO-04)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it('renders modal dialog with accessible attributes when forced open', () => {
    render(<ExitIntentModal forceOpen={true} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'exit-intent-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'exit-intent-desc');
    expect(screen.getByRole('button', { name: /Download Free Playbook/i })).toBeInTheDocument();
  });

  it('dismisses modal on close button, Escape key, or backdrop click', () => {
    const { rerender } = render(<ExitIntentModal forceOpen={true} />);
    fireEvent.click(screen.getByRole('button', { name: /Close modal/i }));
    rerender(<ExitIntentModal forceOpen={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();

    rerender(<ExitIntentModal forceOpen={true} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    rerender(<ExitIntentModal forceOpen={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();

    rerender(<ExitIntentModal forceOpen={true} />);
    fireEvent.mouseDown(screen.getByRole('dialog'));
    rerender(<ExitIntentModal forceOpen={false} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('validates email input and transitions to success view upon submission', async () => {
    const onLeadCapture = vi.fn().mockResolvedValue(undefined);
    render(<ExitIntentModal forceOpen={true} onLeadCapture={onLeadCapture} />);

    const submitBtn = screen.getByRole('button', { name: /Download Free Playbook/i });
    fireEvent.click(submitBtn);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Please enter your work or personal email address/i
    );

    const input = screen.getByPlaceholderText(/engineer@company.com/i);
    fireEvent.change(input, { target: { value: 'candidate@verified.dev' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onLeadCapture).toHaveBeenCalledWith('candidate@verified.dev');
    });
    expect(await screen.findByText(/Playbook Sent!/i)).toBeInTheDocument();
  });
});
