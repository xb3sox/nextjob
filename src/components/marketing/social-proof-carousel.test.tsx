import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SocialProofCarousel } from './social-proof-carousel';

describe('SocialProofCarousel (T-74, FR-CRO-07)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders heading, initial slide, and carousel landmarks', () => {
    render(<SocialProofCarousel />);

    expect(
      screen.getByRole('heading', { level: 2, name: /real candidates\. verifiable results\./i })
    ).toBeInTheDocument();

    const carousel = screen.getByRole('region', {
      name: /candidate success stories and outcomes/i,
    });
    expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');

    // First slide data
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
    expect(screen.getByText('3.2x')).toBeInTheDocument();
    expect(screen.getByText('Interview Response Lift')).toBeInTheDocument();
    expect(screen.getByAltText('Stripe logo')).toBeInTheDocument();
  });

  it('navigates next and previous slides via controls', () => {
    render(<SocialProofCarousel />);

    const nextBtn = screen.getByRole('button', { name: /next slide/i });
    const prevBtn = screen.getByRole('button', { name: /previous slide/i });

    // Click Next -> slide 2
    fireEvent.click(nextBtn);
    expect(screen.getByText('David Zhao')).toBeInTheDocument();
    expect(screen.getByText('93%')).toBeInTheDocument();
    expect(screen.getByAltText('Vercel logo')).toBeInTheDocument();

    // Click Prev -> back to slide 1
    fireEvent.click(prevBtn);
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();

    // Click Prev from slide 1 -> wrap around to last slide
    fireEvent.click(prevBtn);
    expect(screen.getByText('Marcus Vance')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByAltText('Supabase logo')).toBeInTheDocument();
  });

  it('jumps directly to slide when clicking indicator tab', () => {
    render(<SocialProofCarousel />);

    const slide3Tab = screen.getByRole('tab', { name: /go to slide 3: elena rostova/i });
    fireEvent.click(slide3Tab);

    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByAltText('Figma logo')).toBeInTheDocument();
    expect(slide3Tab).toHaveAttribute('aria-selected', 'true');
  });

  it('auto-rotates slides on interval (every 5s)', () => {
    render(<SocialProofCarousel autoRotateInterval={5000} />);

    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('David Zhao')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Elena Rostova')).toBeInTheDocument();
  });

  it('pauses rotation on manual pause toggle and resumes on play', () => {
    render(<SocialProofCarousel autoRotateInterval={5000} />);

    const pauseBtn = screen.getByRole('button', { name: /pause auto-rotation/i });
    fireEvent.click(pauseBtn);

    // After 5s, slide should NOT change because it's paused
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();

    // Resume
    const playBtn = screen.getByRole('button', { name: /resume auto-rotation/i });
    fireEvent.click(playBtn);

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('David Zhao')).toBeInTheDocument();
  });

  it('pauses rotation on mouse hover and resumes on mouse leave', () => {
    render(<SocialProofCarousel autoRotateInterval={5000} />);

    const carousel = screen.getByRole('region', {
      name: /candidate success stories and outcomes/i,
    });

    // Hover
    fireEvent.mouseEnter(carousel);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();

    // Leave
    fireEvent.mouseLeave(carousel);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText('David Zhao')).toBeInTheDocument();
  });

  it('supports keyboard navigation via ArrowRight and ArrowLeft', () => {
    render(<SocialProofCarousel />);

    const carousel = screen.getByRole('region', {
      name: /candidate success stories and outcomes/i,
    });

    fireEvent.keyDown(carousel, { key: 'ArrowRight' });
    expect(screen.getByText('David Zhao')).toBeInTheDocument();

    fireEvent.keyDown(carousel, { key: 'ArrowLeft' });
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
  });
});
