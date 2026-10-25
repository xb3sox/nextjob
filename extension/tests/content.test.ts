import { describe, expect, it } from 'vitest';
import content from '../entrypoints/content';

describe('Extension Content Script', () => {
  it('declares an all-urls match and a main handler', () => {
    expect(content.matches).toEqual(['<all_urls>']);
    expect(content.main).toBeTypeOf('function');
  });
});
