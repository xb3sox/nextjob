import { Laptop, Moon, Sun } from 'lucide-react';
import { createContext, type ReactNode, useContext } from 'react';
import { type ResolvedTheme, type Theme, type UseThemeOptions, useTheme } from '../hooks/use-theme';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps extends UseThemeOptions {
  children: ReactNode;
}

export function ThemeProvider({
  children,
  storageKey = 'nextjob_theme',
  defaultTheme = 'system',
  enableTransitions = true,
}: ThemeProviderProps) {
  const value = useTheme({
    storageKey,
    defaultTheme,
    enableTransitions,
  });

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, resolvedTheme } = useThemeContext();

  const getIcon = () => {
    if (theme === 'system') {
      return <Laptop className="w-4 h-4" aria-hidden="true" />;
    }
    if (resolvedTheme === 'light') {
      return <Sun className="w-4 h-4 text-amber-500" aria-hidden="true" />;
    }
    return <Moon className="w-4 h-4 text-emerald-400" aria-hidden="true" />;
  };

  const getLabel = () => {
    if (theme === 'system') return 'System';
    if (theme === 'light') return 'Light';
    return 'Dark';
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Toggle theme: current mode is ${theme}`}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2 text-xs font-medium text-fog hover:text-paper transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-neutral-950 ${className}`}
    >
      {getIcon()}
      {showLabel && <span>{getLabel()}</span>}
    </button>
  );
}
