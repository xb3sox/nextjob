import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_TRANSCRIPT, VideoPlayer } from './video-player';

describe('VideoPlayer (T-81, FR-VIS-05)', () => {
  beforeEach(() => {
    // Mock HTMLMediaElement methods in happy-dom
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    window.HTMLMediaElement.prototype.pause = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders interactive video element with poster, title and controls', () => {
    render(
      <VideoPlayer
        src="/test-video.mp4"
        poster="/test-poster.jpg"
        title="Evidence Engine Walkthrough"
      />
    );

    const video = screen.getByLabelText('Evidence Engine Walkthrough');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/test-video.mp4');
    expect(video).toHaveAttribute('poster', '/test-poster.jpg');

    // Big play button overlay
    expect(
      screen.getByRole('button', { name: /play evidence engine walkthrough/i })
    ).toBeInTheDocument();

    // Controls
    expect(screen.getByRole('button', { name: /play video/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mute audio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /disable captions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle fullscreen/i })).toBeInTheDocument();
  });

  it('renders background mode with autoplay, muted, and aria-hidden', () => {
    const { container } = render(
      <VideoPlayer mode="background" src="/ambient.mp4" poster="/ambient.jpg" />
    );

    const wrapper = container.querySelector('[aria-hidden="true"]');
    expect(wrapper).toBeInTheDocument();
    const video = container.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('autoplay', '');
    expect(video).toHaveAttribute('loop', '');
    expect(screen.queryByRole('button', { name: /play video/i })).not.toBeInTheDocument();
  });

  it('toggles play and pause state on button click', () => {
    render(<VideoPlayer title="Demo" />);

    const playBtn = screen.getByRole('button', { name: /play video/i });
    fireEvent.click(playBtn);

    expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /pause video/i })).toBeInTheDocument();

    const pauseBtn = screen.getByRole('button', { name: /pause video/i });
    fireEvent.click(pauseBtn);

    expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: /play video/i })).toBeInTheDocument();
  });

  it('toggles audio mute and unmute', () => {
    render(<VideoPlayer title="Audio Test" />);

    const muteBtn = screen.getByRole('button', { name: /mute audio/i });
    fireEvent.click(muteBtn);

    expect(screen.getByRole('button', { name: /unmute audio/i })).toBeInTheDocument();

    const unmuteBtn = screen.getByRole('button', { name: /unmute audio/i });
    fireEvent.click(unmuteBtn);

    expect(screen.getByRole('button', { name: /mute audio/i })).toBeInTheDocument();
  });

  it('toggles captions visibility', () => {
    render(<VideoPlayer title="Captions Test" captionsSrc="/captions.vtt" />);

    const disableCaptionsBtn = screen.getByRole('button', { name: /disable captions/i });
    fireEvent.click(disableCaptionsBtn);

    expect(screen.getByRole('button', { name: /enable captions/i })).toBeInTheDocument();

    const enableCaptionsBtn = screen.getByRole('button', { name: /enable captions/i });
    fireEvent.click(enableCaptionsBtn);

    expect(screen.getByRole('button', { name: /disable captions/i })).toBeInTheDocument();
  });

  it('toggles transcript drawer and displays cues with timestamps', () => {
    render(<VideoPlayer title="Transcript Test" />);

    const transcriptToggle = screen.getByRole('button', { name: /show full transcript/i });
    expect(transcriptToggle).toHaveAttribute('aria-expanded', 'false');

    // Open transcript
    fireEvent.click(transcriptToggle);

    expect(transcriptToggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText('Show Full Transcript')).not.toBeInTheDocument();
    expect(screen.getByText('Hide Full Transcript')).toBeInTheDocument();

    // Verify transcript cues rendered
    for (const cue of DEFAULT_TRANSCRIPT) {
      expect(screen.getByText(cue.text)).toBeInTheDocument();
      expect(screen.getByText(`[${cue.time}]`)).toBeInTheDocument();
    }

    // Close transcript
    const hideBtn = screen.getByRole('button', { name: /hide full transcript/i });
    fireEvent.click(hideBtn);

    expect(hideBtn).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(DEFAULT_TRANSCRIPT[0].text)).not.toBeInTheDocument();
  });
});
