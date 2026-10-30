import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PRESS_MENTIONS, PressSection } from './press-section';

function renderPressSection() {
  return render(
    <MemoryRouter>
      <PressSection />
    </MemoryRouter>
  );
}

describe('PressSection (T-93, FR-TRUST-06)', () => {
  it('renders press section heading, badge, and description', () => {
    renderPressSection();

    expect(
      screen.getByRole('heading', { level: 2, name: /trusted by the press/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/press & recognition/i)).toBeInTheDocument();
    expect(screen.getByText(/leading technology publications/i)).toBeInTheDocument();
  });

  it('renders all default press mentions', () => {
    renderPressSection();

    for (const mention of PRESS_MENTIONS) {
      expect(screen.getByText(mention.title)).toBeInTheDocument();
      expect(screen.getByText(mention.publication)).toBeInTheDocument();
    }
  });

  it('filters press mentions when clicking category tabs', () => {
    renderPressSection();

    // Click "Articles" tab
    const articlesTab = screen.getByRole('tab', { name: /articles/i });
    fireEvent.click(articlesTab);
    expect(articlesTab).toHaveAttribute('aria-selected', 'true');

    // Should show TechCrunch and Bloomberg
    expect(
      screen.getByText(/cryptographic antidote to ai resume hallucination/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/ats black boxes with submission receipts/i)).toBeInTheDocument();

    // Should NOT show Podcast or Award
    expect(screen.queryByText(/ep\. 88: why ai application agents/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/2026 innovation by design honoree/i)).not.toBeInTheDocument();

    // Click "Podcasts" tab
    const podcastsTab = screen.getByRole('tab', { name: /podcasts/i });
    fireEvent.click(podcastsTab);
    expect(podcastsTab).toHaveAttribute('aria-selected', 'true');

    expect(screen.getByText(/ep\. 88: why ai application agents/i)).toBeInTheDocument();
    expect(
      screen.queryByText(/cryptographic antidote to ai resume hallucination/i)
    ).not.toBeInTheDocument();

    // Click "Awards" tab
    const awardsTab = screen.getByRole('tab', { name: /awards/i });
    fireEvent.click(awardsTab);
    expect(awardsTab).toHaveAttribute('aria-selected', 'true');

    expect(screen.getByText(/2026 innovation by design honoree/i)).toBeInTheDocument();
    expect(screen.queryByText(/ep\. 88: why ai application agents/i)).not.toBeInTheDocument();

    // Click "All Coverage" tab to reset
    const allTab = screen.getByRole('tab', { name: /all coverage/i });
    fireEvent.click(allTab);
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    expect(
      screen.getByText(/cryptographic antidote to ai resume hallucination/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/ep\. 88: why ai application agents/i)).toBeInTheDocument();
    expect(screen.getByText(/2026 innovation by design honoree/i)).toBeInTheDocument();
  });

  it('verifies press article external links have security and a11y attributes', () => {
    renderPressSection();

    const techcrunchLink = screen.getByRole('link', {
      name: /nextjob builds the cryptographic antidote to ai resume hallucination on techcrunch/i,
    });

    expect(techcrunchLink).toHaveAttribute('href', expect.stringContaining('techcrunch.com'));
    expect(techcrunchLink).toHaveAttribute('target', '_blank');
    expect(techcrunchLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders publication dates using semantic time elements', () => {
    renderPressSection();

    const timeElements = document.querySelectorAll('time');
    expect(timeElements.length).toBeGreaterThanOrEqual(PRESS_MENTIONS.length);

    const dateValues = Array.from(timeElements).map((el) => el.getAttribute('dateTime'));
    expect(dateValues).toContain('2026-09-15');
    expect(dateValues).toContain('2026-08-28');
  });

  it('renders press media inquiry contact link', () => {
    renderPressSection();

    const pressMailto = screen.getByRole('link', { name: 'press@nextjob.ai' });
    expect(pressMailto).toHaveAttribute('href', 'mailto:press@nextjob.ai');
  });
});
