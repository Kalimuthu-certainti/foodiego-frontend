import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'muted' | 'info';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 ring-slate-600/15',
  success: 'bg-green-50 text-green-700 ring-green-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/25',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  muted: 'bg-slate-100 text-slate-500 ring-slate-500/15',
  info: 'bg-brand-50 text-brand-700 ring-brand-600/20',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
