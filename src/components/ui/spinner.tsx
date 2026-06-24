import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center">
      <Loader2 className={cn('h-5 w-5 animate-spin text-slate-400', className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
