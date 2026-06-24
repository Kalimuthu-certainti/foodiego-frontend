import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900',
        'placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50',
        invalid ? 'border-red-500 focus-visible:ring-red-500' : 'border-slate-300',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
