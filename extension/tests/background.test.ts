import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';
import background from '../entrypoints/background';

describe('Extension Background Script', () => {
  let consoleSpy: MockInstance<typeof console.log>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('logs an initialization message when the background entrypoint starts', () => {
    background.main();

    expect(consoleSpy).toHaveBeenCalledWith('NextJob background script initialized');
  });
});
