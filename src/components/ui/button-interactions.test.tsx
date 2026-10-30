import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button Micro-Interactions (T-79, FR-VIS-03)', () => {
  it('renders button with active scale and transition micro-interaction classes', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('transition-all');
    expect(button).toHaveClass('duration-150');
    expect(button).toHaveClass('active:scale-[0.98]');
  });

  it('renders default button variant with subtle hover elevation and shadow', () => {
    render(<Button variant="default">Elevated</Button>);

    const button = screen.getByRole('button', { name: /elevated/i });
    expect(button).toHaveClass('hover:-translate-y-0.5');
    expect(button).toHaveClass('hover:shadow-md');
  });

  it('includes accessible focus-visible ring styling for keyboard users', () => {
    render(<Button>Focus test</Button>);

    const button = screen.getByRole('button', { name: /focus test/i });
    expect(button).toHaveClass('focus-visible:ring-2');
    expect(button).toHaveClass('focus-visible:ring-moss');
  });

  it('safely disables transforms under prefers-reduced-motion', () => {
    render(<Button>Motion safety</Button>);

    const button = screen.getByRole('button', { name: /motion safety/i });
    expect(button).toHaveClass('motion-reduce:transform-none');
    expect(button).toHaveClass('motion-reduce:transition-none');
  });

  it('applies subtle interactive hover border styling on outline variant', () => {
    render(<Button variant="outline">Outline</Button>);

    const button = screen.getByRole('button', { name: /outline/i });
    expect(button).toHaveClass('hover:border-moss/40');
    expect(button).toHaveClass('hover:-translate-y-0.5');
  });
});
