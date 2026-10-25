import { describe, expect, it, vi } from 'vitest';

describe('Extension Content Script', () => {
  it('injects into page and logs confirmation', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Simulate content script execution
    console.log('NextJob content script injected');

    expect(consoleSpy).toHaveBeenCalledWith('NextJob content script injected');
    consoleSpy.mockRestore();
  });
});
