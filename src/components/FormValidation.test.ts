import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from './FormValidation';

describe('useFormValidation', () => {
  it('initializes with empty fields', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '', password: '' },
        {
          email: { required: true },
          password: { required: true, minLength: 8 },
        }
      )
    );

    expect(result.current.fields.email.value).toBe('');
    expect(result.current.fields.password.value).toBe('');
    expect(result.current.fields.email.error).toBeNull();
    expect(result.current.fields.password.error).toBeNull();
  });

  it('validates required fields', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '' },
        { email: { required: true } }
      )
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.fields.email.error).toBe('This field is required');
    expect(result.current.fields.email.touched).toBe(true);
  });

  it('validates minLength', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { password: '123' },
        { password: { minLength: 8 } }
      )
    );

    act(() => {
      result.current.handleBlur('password');
    });

    expect(result.current.fields.password.error).toBe('Must be at least 8 characters');
  });

  it('validates pattern', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: 'invalid-email' },
        { email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ } }
      )
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.fields.email.error).toBe('Invalid format');
  });

  it('clears error when value is valid', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '' },
        { email: { required: true } }
      )
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.fields.email.error).toBe('This field is required');

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.fields.email.error).toBeNull();
    expect(result.current.fields.email.valid).toBe(true);
  });

  it('validates all fields', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: '', password: '123' },
        {
          email: { required: true },
          password: { required: true, minLength: 8 },
        }
      )
    );

    let isValid = false;
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(false);
    expect(result.current.fields.email.error).toBe('This field is required');
    expect(result.current.fields.password.error).toBe('Must be at least 8 characters');
  });

  it('returns true when all fields are valid', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: 'test@example.com', password: 'password123' },
        {
          email: { required: true },
          password: { required: true, minLength: 8 },
        }
      )
    );

    let isValid = false;
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(true);
    expect(result.current.isValid).toBe(true);
  });

  it('resets all fields', () => {
    const { result } = renderHook(() =>
      useFormValidation(
        { email: 'test@example.com' },
        { email: { required: true } }
      )
    );

    act(() => {
      result.current.handleChange('email', 'new@example.com');
      result.current.handleBlur('email');
    });

    expect(result.current.fields.email.value).toBe('new@example.com');
    expect(result.current.fields.email.touched).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.fields.email.value).toBe('test@example.com');
    expect(result.current.fields.email.touched).toBe(false);
    expect(result.current.fields.email.error).toBeNull();
  });

  it('supports custom validation', () => {
    const customValidator = (value: string) => {
      if (value !== 'password123') {
        return 'Password must be "password123"';
      }
      return null;
    };

    const { result } = renderHook(() =>
      useFormValidation(
        { password: 'wrong' },
        { password: { custom: customValidator } }
      )
    );

    act(() => {
      result.current.handleBlur('password');
    });

    expect(result.current.fields.password.error).toBe('Password must be "password123"');

    act(() => {
      result.current.handleChange('password', 'password123');
      result.current.handleBlur('password');
    });

    expect(result.current.fields.password.error).toBeNull();
  });
});
