import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export interface UseThemeOptions {
  storageKey?: string;
  defaultTheme?: Theme;
  enableTransitions?: boolean;
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getInitialTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === 'undefined') return defaultTheme;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
  } catch {
    // Ignore restricted localStorage access
  }
  return defaultTheme;
}

export function useTheme({
  storageKey = 'nextjob_theme',
  defaultTheme = 'system',
  enableTransitions = true,
}: UseThemeOptions = {}) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme(storageKey, defaultTheme));
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme;

  // Listen to system prefers-color-scheme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Update DOM classes and data-theme attribute
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (enableTransitions) {
      root.classList.add('theme-transition');
      const timer = window.setTimeout(() => {
        root.classList.remove('theme-transition');
      }, 250);

      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
      root.setAttribute('data-theme', resolvedTheme);

      return () => {
        window.clearTimeout(timer);
        root.classList.remove('theme-transition');
      };
    }

    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    root.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme, enableTransitions]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {
      // Ignore storage write failure
    }
  };

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    resolvedTheme,
    systemTheme,
  };
}
