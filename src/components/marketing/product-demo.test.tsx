import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MOCK_CRITERIA, ProductDemo } from './product-demo';

describe('ProductDemo (T-69, FR-CRO-01)', () => {
  it('renders tour header and all 4 walkthrough tabs', () => {
    render(<ProductDemo />);

    expect(
      screen.getByRole('heading', { level: 2, name: /experience nextjob in 60 seconds/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/interactive product tour/i)).toBeInTheDocument();

    const tablist = screen.getByRole('tablist', { name: /product demo walkthrough steps/i });
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(4);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('renders Step 1 eligibility check with 10-point hard criteria', () => {
    render(<ProductDemo />);

    expect(screen.getByRole('tabpanel', { name: /eligibility check/i })).toBeInTheDocument();
    expect(screen.getByText('Staff Frontend Systems Engineer')).toBeInTheDocument();
    expect(screen.getByText(/96% match • eligible/i)).toBeInTheDocument();

    for (const criterion of MOCK_CRITERIA) {
      expect(screen.getByText(criterion.name)).toBeInTheDocument();
      expect(screen.getByText(criterion.detail)).toBeInTheDocument();
    }
  });

  it('navigates through steps using next and previous buttons', () => {
    render(<ProductDemo />);

    const prevButton = screen.getByRole('button', { name: /previous step/i });
    const nextButton = screen.getByRole('button', { name: /next step/i });

    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    // Move to Step 2
    fireEvent.click(nextButton);
    expect(screen.getByRole('tabpanel', { name: /evidence tailoring/i })).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();

    // Move to Step 3
    fireEvent.click(nextButton);
    expect(screen.getByRole('tabpanel', { name: /1-click autofill/i })).toBeInTheDocument();

    // Move to Step 4
    fireEvent.click(nextButton);
    expect(screen.getByRole('tabpanel', { name: /frozen receipt/i })).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    // Back to Step 3
    fireEvent.click(prevButton);
    expect(screen.getByRole('tabpanel', { name: /1-click autofill/i })).toBeInTheDocument();
  });

  it('allows clicking directly on step tabs', () => {
    render(<ProductDemo />);

    const receiptTab = screen.getByRole('tab', { name: /frozen receipt/i });
    fireEvent.click(receiptTab);

    expect(screen.getByRole('tabpanel', { name: /frozen receipt/i })).toBeInTheDocument();
    expect(screen.getByText(/cryptographic submission receipt/i)).toBeInTheDocument();
    expect(screen.getByText(/rec_9f82d1c0a87e44b3/i)).toBeInTheDocument();
  });

  it('supports interactive actions: tailoring acceptance and extension simulation', () => {
    render(<ProductDemo />);

    // Switch to tailoring
    const tailoringTab = screen.getByRole('tab', { name: /evidence tailoring/i });
    fireEvent.click(tailoringTab);

    const acceptBtn = screen.getByRole('button', { name: /accept tailoring/i });
    fireEvent.click(acceptBtn);
    expect(screen.getByText(/✓ tailored bullet approved/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tailoring accepted/i })).toBeInTheDocument();

    // Switch to extension autofill
    const extensionTab = screen.getByRole('tab', { name: /1-click autofill/i });
    fireEvent.click(extensionTab);

    const simulateBtn = screen.getByRole('button', { name: /simulate 1-click autofill/i });
    fireEvent.click(simulateBtn);
    expect(screen.getByText('Alex Mercer')).toBeInTheDocument();
    expect(screen.getByText(/authorized to work for any us employer/i)).toBeInTheDocument();
  });

  it('supports keyboard navigation across tabs with ArrowRight and ArrowLeft', () => {
    render(<ProductDemo />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    expect(screen.getByRole('tabpanel', { name: /evidence tailoring/i })).toBeInTheDocument();

    const activeTab = screen.getByRole('tab', { name: /evidence tailoring/i });
    fireEvent.keyDown(activeTab, { key: 'ArrowLeft' });
    expect(screen.getByRole('tabpanel', { name: /eligibility check/i })).toBeInTheDocument();
  });
});
