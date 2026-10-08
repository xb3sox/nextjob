import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ButtonLoader, LoadingButton, ProgressBar } from './Loading';

describe('Loading Components', () => {
  describe('ButtonLoader', () => {
    it('renders with default size', () => {
      render(<ButtonLoader />);
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    it('renders with small size', () => {
      render(<ButtonLoader size="sm" />);
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    it('renders with large size', () => {
      render(<ButtonLoader size="lg" />);
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });
  });

  describe('LoadingButton', () => {
    it('renders children when not loading', () => {
      render(<LoadingButton loading={false}>Click me</LoadingButton>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('shows loader when loading', () => {
      render(<LoadingButton loading={true}>Click me</LoadingButton>);
      const loader = screen.getByRole('status');
      expect(loader).toBeInTheDocument();
    });

    it('is disabled when loading', () => {
      render(<LoadingButton loading={true}>Click me</LoadingButton>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('has aria-busy attribute when loading', () => {
      render(<LoadingButton loading={true}>Click me</LoadingButton>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('ProgressBar', () => {
    it('renders with value and max', () => {
      render(<ProgressBar value={50} max={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
      expect(progressbar).toHaveAttribute('aria-valuemax', '100');
    });

    it('renders with label', () => {
      render(<ProgressBar value={75} max={100} label="Progress" />);
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('clamps value to max', () => {
      render(<ProgressBar value={150} max={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    });

    it('clamps value to min', () => {
      render(<ProgressBar value={-50} max={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });
  });
});
