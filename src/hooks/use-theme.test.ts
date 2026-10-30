import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getInitialTheme, getSystemTheme, useTheme } from './use-theme';

describe('useTheme hook (T-82, FR-VIS-06)', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let changeListeners: ((e: MediaQueryListEvent) => void)[] = [];

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    changeListeners = [];

    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((_event: string, listener: (e: MediaQueryListEvent) => void) => {
        changeListeners.push(listener);
      }),
      removeEventListener: vi.fn((_event: string, listener: (e: MediaQueryListEvent) => void) => {
        changeListeners = changeListeners.filter((l) => l !== listener);
      }),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('detects system theme accurately', () => {
    expect(getSystemTheme()).toBe('dark');

    matchMediaMock.mockImplementationOnce(() => ({
      matches: false,
    }));
    expect(getSystemTheme()).toBe('light');
  });

  it('retrieves stored theme from localStorage or falls back to default', () => {
    expect(getInitialTheme('nextjob_theme', 'system')).toBe('system');

    localStorage.setItem('nextjob_theme', 'light');
    expect(getInitialTheme('nextjob_theme', 'system')).toBe('light');

    localStorage.setItem('nextjob_theme', 'invalid-theme');
    expect(getInitialTheme('nextjob_theme', 'dark')).toBe('dark');
  });

  it('initializes with system theme and resolves to dark/light', () => {
    const { result } = renderHook(() =>
      useTheme({ defaultTheme: 'system', enableTransitions: false })
    );

    expect(result.current.theme).toBe('system');
    expect(result.current.resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('switches theme manually and persists to localStorage', () => {
    const { result } = renderHook(() =>
      useTheme({ defaultTheme: 'dark', enableTransitions: false })
    );

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(result.current.resolvedTheme).toBe('light');
    expect(localStorage.getItem('nextjob_theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('cycles through theme options via toggleTheme', () => {
    const { result } = renderHook(() =>
      useTheme({ defaultTheme: 'dark', enableTransitions: false })
    );

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('system');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');
  });
});
