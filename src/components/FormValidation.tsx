import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface FieldValidation {
  value: string;
  error: string | null;
  touched: boolean;
  valid: boolean;
}

export function useFormValidation<T extends Record<string, string>>(
  initialValues: T,
  rules: Record<keyof T, ValidationRule>
) {
  const [fields, setFields] = useState<Record<keyof T, FieldValidation>>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = {
        value: initialValues[key as keyof T],
        error: null,
        touched: false,
        valid: false,
      };
      return acc;
    }, {} as Record<keyof T, FieldValidation>)
  );

  const validateField = (name: keyof T, value: string): string | null => {
    const rule = rules[name];
    
    if (rule.required && !value.trim()) {
      return 'This field is required';
    }
    
    if (rule.minLength && value.length < rule.minLength) {
      return `Must be at least ${rule.minLength} characters`;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      return `Must be no more than ${rule.maxLength} characters`;
    }
    
    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Invalid format';
    }
    
    if (rule.custom) {
      return rule.custom(value);
    }
    
    return null;
  };

  const handleChange = (name: keyof T, value: string) => {
    const error = validateField(name, value);
    setFields(prev => ({
      ...prev,
      [name]: {
        value,
        error: prev[name].touched ? error : null,
        touched: prev[name].touched,
        valid: !error,
      },
    }));
  };

  const handleBlur = (name: keyof T) => {
    const field = fields[name];
    const error = validateField(name, field.value);
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
        error,
        valid: !error,
      },
    }));
  };

  const validateAll = (): boolean => {
    let allValid = true;
    const newFields = { ...fields };
    
    Object.keys(rules).forEach((key) => {
      const name = key as keyof T;
      const error = validateField(name, fields[name].value);
      newFields[name] = {
        ...fields[name],
        touched: true,
        error,
        valid: !error,
      };
      if (error) allValid = false;
    });
    
    setFields(newFields);
    return allValid;
  };

  const reset = () => {
    setFields(
      Object.keys(initialValues).reduce((acc, key) => {
        acc[key as keyof T] = {
          value: initialValues[key as keyof T],
          error: null,
          touched: false,
          valid: false,
        };
        return acc;
      }, {} as Record<keyof T, FieldValidation>)
    );
  };

  return {
    fields,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid: Object.values(fields).every(f => f.valid),
  };
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  error,
  touched,
  onChange,
  onBlur,
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  error: string | null;
  touched: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  placeholder?: string;
  required?: boolean;
}) {
  const hasError = touched && error;
  const isValid = touched && !error && value;

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors ${
            hasError
              ? 'border-red-500 bg-red-500/5 text-slate-100 focus:border-red-500 focus:ring-red-500/20'
              : isValid
              ? 'border-emerald-500 bg-emerald-500/5 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/20'
              : 'border-slate-700 bg-slate-900 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500/20'
          } focus:outline-none focus:ring-2`}
        />
        {isValid && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
        )}
        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-400" />
        )}
      </div>
      {hasError && (
        <p id={`${name}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormSuccess({ message }: { message: string }) {
  return (
    <div 
      className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
      role="alert"
      aria-live="polite"
    >
      <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
      <p className="text-sm text-emerald-400">{message}</p>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div 
      className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}
