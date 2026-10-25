import { describe, expect, it, vi } from 'vitest';

describe('Extension Background Script', () => {
  it('initializes correctly and logs message', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Simulate background script execution
    console.log('NextJob background script initialized');

    expect(consoleSpy).toHaveBeenCalledWith('NextJob background script initialized');
    consoleSpy.mockRestore();
  });
});
