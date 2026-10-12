import { useRef, useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Pure validator: never call side-effectful code (custom validators) inside a
// React state updater — updaters must be pure and may run twice in StrictMode.
function computeFieldError<T extends Record<string, string>>(
  rules: Record<keyof T, ValidationRule>,
  name: keyof T,
  value: string
): string | null {
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
}

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

  const fieldsRef = useRef(fields);
  const commitFields = (next: Record<keyof T, FieldValidation>) => {
    fieldsRef.current = next;
    setFields(next);
  };

  const validateField = (name: keyof T, value: string): string | null =>
    computeFieldError(rules, name, value);

  const handleChange = (name: keyof T, value: string) => {
    const error = validateField(name, value);
    const prev = fieldsRef.current;
    commitFields({
      ...prev,
      [name]: {
        value,
        error: prev[name].touched ? error : null,
        touched: prev[name].touched,
        valid: !error,
      },
    });
  };

  // Read values from the ref (kept in sync with state) so we never validate
  // against stale state (e.g. blur fired immediately after change in the same
  // tick), while keeping the state updater pure — no side effects inside it.
  const handleBlur = (name: keyof T): boolean => {
    const prev = fieldsRef.current;
    const error = validateField(name, prev[name].value);
    commitFields({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
        error,
        valid: !error,
      },
    });
    return !error;
  };

  const validateAll = (): boolean => {
    const prev = fieldsRef.current;
    const newFields = { ...prev };
    let allValid = true;
    Object.keys(rules).forEach((key) => {
      const name = key as keyof T;
      const error = validateField(name, prev[name].value);
      newFields[name] = {
        ...prev[name],
        touched: true,
        error,
        valid: !error,
      };
      if (error) allValid = false;
    });
    commitFields(newFields);
    return allValid;
  };

  const reset = () => {
    commitFields(
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
      <label htmlFor={name} className="block text-sm font-medium text-fog">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
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
              ? 'border-danger bg-danger/5 text-paper focus:border-danger focus:ring-danger/20'
              : isValid
              ? 'border-moss-deep bg-moss/5 text-paper focus:border-moss-deep focus:ring-moss/20'
              : 'border-white/15 bg-panel text-paper focus:border-moss-deep focus:ring-moss/20'
          } focus:outline-none focus:ring-2`}
        />
        {isValid && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-moss" />
        )}
        {hasError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-danger" />
        )}
      </div>
      {hasError && (
        <p id={`${name}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function FormSuccess({ message }: { message: string }) {
  return (
    <div 
      className="flex items-center gap-3 p-4 rounded-lg bg-moss/10 border border-moss/20"
      role="alert"
      aria-live="polite"
    >
      <CheckCircle className="h-5 w-5 text-moss shrink-0" />
      <p className="text-sm text-moss">{message}</p>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div 
      className="flex items-center gap-3 p-4 rounded-lg bg-danger/10 border border-danger/20"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle className="h-5 w-5 text-danger shrink-0" />
      <p className="text-sm text-danger">{message}</p>
    </div>
  );
}
