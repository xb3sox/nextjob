import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider, ThemeToggle, useThemeContext } from './theme-provider';

describe('ThemeProvider & ThemeToggle (T-82, FR-VIS-06)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders children within ThemeProvider', () => {
    render(
      <ThemeProvider>
        <div data-testid="child-element">Hello Theme</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });

  it('renders accessible ThemeToggle button and updates theme on click', () => {
    render(
      <ThemeProvider defaultTheme="dark" enableTransitions={false}>
        <ThemeToggle showLabel />
      </ThemeProvider>
    );

    const button = screen.getByRole('button', { name: /Toggle theme/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Toggle theme: current mode is dark');
    expect(screen.getByText('Dark')).toBeInTheDocument();

    // Click to cycle to light
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Toggle theme: current mode is light');
    expect(screen.getByText('Light')).toBeInTheDocument();

    // Click to cycle to system
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Toggle theme: current mode is system');
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('throws an error if useThemeContext is consumed outside ThemeProvider', () => {
    const ProblematicComponent = () => {
      useThemeContext();
      return <div>Never rendered</div>;
    };

    expect(() => render(<ProblematicComponent />)).toThrow(
      'useThemeContext must be used within a ThemeProvider'
    );
  });
});
