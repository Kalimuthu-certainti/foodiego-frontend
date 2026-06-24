import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../utils/cn';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-3 text-slate-400">
        {icon ?? <Inbox className="h-10 w-10" />}
      </div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
