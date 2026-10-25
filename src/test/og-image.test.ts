import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guards the social preview image contract for the single-page app.
 *
 * This SPA ships exactly one `index.html`, so every crawler that follows
 * `og:image` or `twitter:image` must resolve to a real, non-trivial PNG under
 * `public/`. A metadata tag pointing at a missing or placeholder asset breaks
 * every preview card, so that is a test failure here rather than a manual
 * checklist item.
 */

const repoRoot = path.resolve(process.cwd());
const indexHtml = readFileSync(path.join(repoRoot, 'index.html'), 'utf8');
const publicDir = path.join(repoRoot, 'public');

const CANONICAL_ORIGIN = 'https://nextjob.ai';
const MIN_PNG_BYTES = 10 * 1024;
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const SOCIAL_IMAGE_KEYS = ['og:image', 'twitter:image'];

interface SocialImage {
  key: string;
  url: string;
}

function metaAttribute(tag: string, name: string): string | undefined {
  const match = new RegExp(`${name}\\s*=\\s*"([^"]*)"`, 'i').exec(tag);
  return match?.[1];
}

function readSocialImages(html: string): SocialImage[] {
  const images: SocialImage[] = [];

  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = (metaAttribute(tag, 'property') ?? metaAttribute(tag, 'name') ?? '')
      .trim()
      .toLowerCase();
    const content = metaAttribute(tag, 'content')?.trim();

    if (key && content && SOCIAL_IMAGE_KEYS.includes(key)) {
      images.push({ key, url: content });
    }
  }

  return images;
}

/** Maps a declared metadata URL onto the file the Worker actually serves. */
function publicFileFor(url: string): string {
  const { pathname } = new URL(url, CANONICAL_ORIGIN);
  return path.join(publicDir, decodeURIComponent(pathname));
}

const socialImages = readSocialImages(indexHtml);

describe('social preview images', () => {
  it('declares both og:image and twitter:image in index.html', () => {
    const declaredKeys = new Set(socialImages.map((image) => image.key));

    expect(declaredKeys).toContain('og:image');
    expect(declaredKeys).toContain('twitter:image');
  });

  it('uses the canonical nextjob.ai origin for every social image URL', () => {
    expect(socialImages.length).toBeGreaterThan(0);

    for (const { key, url } of socialImages) {
      expect(() => new URL(url), `${key} must be an absolute URL`).not.toThrow();
      expect(new URL(url).origin, `${key} must use the canonical domain`).toBe(CANONICAL_ORIGIN);
    }
  });

  it.each(socialImages)(
    'serves $key from a real PNG under public/',
    ({ key, url }: SocialImage) => {
      const file = publicFileFor(url);

      expect(path.relative(publicDir, file), `${key} escapes public/`).not.toMatch(/^\.\./);

      const assetExists = existsSync(file);
      expect(assetExists, `${key} points at a missing asset: ${file}`).toBe(true);
      if (!assetExists) return;

      const bytes = statSync(file).size;
      expect(
        bytes,
        `${key} asset is too small to be a real og image (${bytes} bytes)`
      ).toBeGreaterThan(MIN_PNG_BYTES);

      const header = [...readFileSync(file).subarray(0, PNG_MAGIC.length)];
      expect(header, `${key} asset is not a PNG`).toEqual(PNG_MAGIC);
    }
  );
});
