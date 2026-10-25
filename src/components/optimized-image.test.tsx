import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { generateSrcSet, getOptimizedImageUrl, OptimizedImage } from './optimized-image';

describe('getOptimizedImageUrl', () => {
  it('returns empty string if baseSrc is empty', () => {
    expect(getOptimizedImageUrl('')).toBe('');
  });

  it('transforms extension when format is specified', () => {
    expect(getOptimizedImageUrl('/hero.jpg', 'webp')).toBe('/hero.webp');
    expect(getOptimizedImageUrl('/images/banner.png', 'avif')).toBe('/images/banner.avif');
  });

  it('appends width parameter when specified', () => {
    expect(getOptimizedImageUrl('/hero.jpg', 'webp', 800)).toBe('/hero.webp?w=800');
  });

  it('preserves existing query parameters', () => {
    expect(getOptimizedImageUrl('/hero.jpg?v=1', 'webp', 640)).toBe('/hero.webp?v=1&w=640');
  });

  it('handles data URLs without altering them', () => {
    const dataUrl = 'data:image/svg+xml;base64,12345';
    expect(getOptimizedImageUrl(dataUrl, 'webp', 640)).toBe(dataUrl);
  });
});

describe('generateSrcSet', () => {
  it('generates a formatted srcset string for widths', () => {
    const srcset = generateSrcSet('/logo.png', 'webp', [320, 640]);
    expect(srcset).toBe('/logo.webp?w=320 320w, /logo.webp?w=640 640w');
  });
});

describe('OptimizedImage', () => {
  it('renders a picture element with AVIF and WebP sources and an img fallback', () => {
    render(<OptimizedImage src="/hero.jpg" alt="Hero image" width={1200} height={600} />);

    const img = screen.getByRole('img', { name: 'Hero image' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/hero.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');

    const picture = img.closest('picture');
    expect(picture).not.toBeNull();

    const sources = picture?.querySelectorAll('source');
    expect(sources).toHaveLength(2); // avif and webp

    expect(sources?.[0]).toHaveAttribute('type', 'image/avif');
    expect(sources?.[1]).toHaveAttribute('type', 'image/webp');
  });

  it('respects priority prop by setting loading="eager" and fetchpriority="high"', () => {
    render(<OptimizedImage src="/hero.jpg" alt="Hero image" priority />);

    const img = screen.getByRole('img', { name: 'Hero image' });
    expect(img).toHaveAttribute('loading', 'eager');
    expect(img).toHaveAttribute('fetchpriority', 'high');
  });

  it('applies aspect-ratio style to prevent layout shift (CLS)', () => {
    render(<OptimizedImage src="/hero.jpg" alt="Hero image" width={1600} height={900} />);

    const img = screen.getByRole('img', { name: 'Hero image' });
    expect(img.style.aspectRatio).toBe('1600 / 900');
  });

  it('applies custom aspectRatio prop when provided', () => {
    render(<OptimizedImage src="/hero.jpg" alt="Hero image" aspectRatio="16/9" />);

    const img = screen.getByRole('img', { name: 'Hero image' });
    expect(img.style.aspectRatio).toBe('16 / 9');
  });

  it('handles art direction sources correctly', () => {
    const artDirection = [
      {
        media: '(min-width: 1024px)',
        src: '/hero-desktop.jpg',
        width: 1920,
        height: 1080,
      },
      {
        media: '(max-width: 639px)',
        src: '/hero-mobile.jpg',
        width: 640,
        height: 800,
      },
    ];

    render(<OptimizedImage src="/hero-default.jpg" alt="Hero image" artDirection={artDirection} />);

    const img = screen.getByRole('img', { name: 'Hero image' });
    const picture = img.closest('picture');
    const sources = picture?.querySelectorAll('source');

    // Each art direction has 2 format sources (avif, webp) + 1 default source = 3 per art item (6 total)
    // plus 2 global format sources (avif, webp) = 8 total sources
    expect(sources).toHaveLength(8);

    const firstArtSource = sources?.[0];
    expect(firstArtSource).toHaveAttribute('media', '(min-width: 1024px)');
  });

  it('renders blur placeholder initially and transitions on load', () => {
    const handleLoad = vi.fn();
    render(
      <OptimizedImage
        src="/hero.jpg"
        alt="Hero image"
        placeholder="blur"
        blurDataURL="data:image/png;base64,blurdata"
        onLoad={handleLoad}
      />
    );

    const img = screen.getByRole('img', { name: 'Hero image' });
    expect(img.className).toContain('blur-md');
    expect(img.style.backgroundImage).toContain('data:image/png;base64,blurdata');

    fireEvent.load(img);

    expect(handleLoad).toHaveBeenCalled();
    expect(img.className).toContain('blur-0');
  });

  it('handles error state gracefully', () => {
    const handleError = vi.fn();
    render(<OptimizedImage src="/broken.jpg" alt="Broken image" onError={handleError} />);

    const img = screen.getByRole('img', { name: 'Broken image' });
    fireEvent.error(img);

    expect(handleError).toHaveBeenCalled();
    expect(img.className).toContain('opacity-50 grayscale');
  });
});
