import type { ReactNode } from 'react';
import { Label } from './ui/label';
import { cn } from '../utils/cn';

export interface FormFieldProps {
  /** id of the control, used for label association. */
  htmlFor?: string;
  label: ReactNode;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** label + control + error message wrapper. */
export function FormField({
  htmlFor,
  label,
  required,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && !error ? <p className="text-xs text-slate-500">{hint}</p> : null}
      {error ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
