import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '../entrypoints/popup/App';

describe('Extension Popup App', () => {
  it('renders title and status text correctly', () => {
    render(<App />);

    expect(screen.getByText('NextJob')).toBeInTheDocument();
    expect(screen.getByText('Browser Extension Connected')).toBeInTheDocument();
  });
});
