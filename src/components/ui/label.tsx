import { forwardRef } from 'react';
import type { LabelHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-slate-700', className)}
      {...props}
    >
      {children}
      {required ? <span className="ml-0.5 text-red-500">*</span> : null}
    </label>
  ),
);
Label.displayName = 'Label';
