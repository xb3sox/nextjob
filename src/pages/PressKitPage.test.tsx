import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PressKitPage from './PressKitPage';

function renderPressKitPage() {
  return render(
    <MemoryRouter>
      <PressKitPage />
    </MemoryRouter>
  );
}

describe('PressKitPage (T-104, FR-GROW-07)', () => {
  it('renders press kit header, hero, and main sections', () => {
    renderPressKitPage();

    expect(
      screen.getByRole('heading', { level: 1, name: 'NextJob Press Kit' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Logo Pack & Vector Assets' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Brand Guidelines & Positioning' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'High-Resolution Product Screenshots' })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Media Contact & Inquiries' })).toBeInTheDocument();
  });

  it('contains valid download links for logo pack and brand guidelines PDF', () => {
    renderPressKitPage();

    const logoZipLinks = screen.getAllByRole('link', {
      name: /Download Logo Pack \(\.zip\)|Download all vector logos/i,
    });
    expect(logoZipLinks.length).toBeGreaterThan(0);
    expect(logoZipLinks[0]).toHaveAttribute('href', '/press-kit/logos/nextjob-logo-pack.zip');
    expect(logoZipLinks[0]).toHaveAttribute('download');

    const pdfLinks = screen.getAllByRole('link', { name: /Download Brand Guidelines \(PDF\)/i });
    expect(pdfLinks.length).toBeGreaterThan(0);
    expect(pdfLinks[0]).toHaveAttribute('href', '/press-kit/brand-guidelines.pdf');
    expect(pdfLinks[0]).toHaveAttribute('download');
  });

  it('displays high-resolution product screenshot previews and download buttons', () => {
    renderPressKitPage();

    expect(screen.getByText('Dashboard & Application Tracker')).toBeInTheDocument();
    expect(screen.getByText('AI Job Match & Eligibility Verification')).toBeInTheDocument();
    expect(screen.getByText('Evidence Provenance & Verification')).toBeInTheDocument();
    expect(screen.getByText('Cryptographic Submission Receipt')).toBeInTheDocument();

    const screenshotDownloadLinks = screen.getAllByRole('link', { name: /Download High-Res/i });
    expect(screenshotDownloadLinks.length).toBe(4);
    expect(screenshotDownloadLinks[0]).toHaveAttribute(
      'href',
      '/press-kit/screenshots/dashboard.png'
    );
    expect(screenshotDownloadLinks[0]).toHaveAttribute('download', 'dashboard.png');
  });

  it('displays brand color palette and company boilerplates', () => {
    renderPressKitPage();

    expect(screen.getByText('50-Word Boilerplate')).toBeInTheDocument();
    expect(screen.getByText('100-Word Boilerplate')).toBeInTheDocument();
    expect(screen.getByText('Moss')).toBeInTheDocument();
    expect(screen.getByText('#34D399')).toBeInTheDocument();
    expect(screen.getByText('Ink')).toBeInTheDocument();
    expect(screen.getByText('Paper')).toBeInTheDocument();
    expect(screen.getByText('Fog')).toBeInTheDocument();
  });

  it('shows error alert if required form fields are missing', async () => {
    renderPressKitPage();

    const submitBtn = screen.getByRole('button', { name: /Submit Media Inquiry/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent('Please enter your full name.');
  });

  it('shows error alert if email address is invalid', async () => {
    renderPressKitPage();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alex Morgan' } });
    fireEvent.change(screen.getByLabelText(/Media Outlet/i), {
      target: { value: 'The Tech Journal' },
    });
    fireEvent.change(screen.getByLabelText(/Work Email/i), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByLabelText(/Inquiry Details/i), {
      target: { value: 'Inquiry message.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Media Inquiry/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Please enter a valid email address.'
    );
  });

  it('successfully submits media inquiry with valid inputs', async () => {
    renderPressKitPage();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Alex Morgan' } });
    fireEvent.change(screen.getByLabelText(/Media Outlet/i), {
      target: { value: 'The Tech Journal' },
    });
    fireEvent.change(screen.getByLabelText(/Work Email/i), {
      target: { value: 'alex@techjournal.com' },
    });
    fireEvent.change(screen.getByLabelText(/Inquiry Details/i), {
      target: { value: 'We would like to request an interview regarding evidence provenance.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Media Inquiry/i }));

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        'Inquiry received! Thank you Alex Morgan.'
      );
    });
  });
});
