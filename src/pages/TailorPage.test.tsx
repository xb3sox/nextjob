import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import TailorPage from './TailorPage';

function renderPage() {
  return render(
    <MemoryRouter>
      <TailorPage />
    </MemoryRouter>
  );
}

describe('TailorPage', () => {
  it('renders a proposed statement with its original claim and evidence', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Review your draft' })).toBeInTheDocument();

    // Original side: the stored claim, not the generated wording.
    expect(screen.getByText(/company: Tech Corp/)).toBeInTheDocument();
    // Proposed side: what the engine generated from that claim.
    expect(screen.getByText(/Senior Software Engineer at Tech Corp/)).toBeInTheDocument();
    // Evidence chips link back to the claim titles.
    expect(screen.getAllByText('Senior Software Engineer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('TypeScript').length).toBeGreaterThan(0);
  });

  it('accepts a statement', async () => {
    renderPage();

    const accept = await screen.findAllByRole('button', { name: 'Accept experience statement' });
    fireEvent.click(accept[0]);

    expect(accept[0]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByText('accepted').length).toBeGreaterThan(0);
  });

  it('rejects a statement', async () => {
    renderPage();

    const reject = await screen.findAllByRole('button', { name: 'Reject experience statement' });
    fireEvent.click(reject[0]);

    expect(reject[0]).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByText('rejected').length).toBeGreaterThan(0);
  });

  it('edits a statement', async () => {
    renderPage();

    const edit = await screen.findAllByRole('button', { name: 'Edit experience statement' });
    fireEvent.click(edit[0]);

    const textarea = screen.getByLabelText('Edit proposed experience statement');
    fireEvent.change(textarea, { target: { value: 'Rewritten for this role.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save edit' }));

    expect(screen.getByText('Rewritten for this role.')).toBeInTheDocument();
    expect(screen.getAllByText('edited').length).toBeGreaterThan(0);
  });
});
