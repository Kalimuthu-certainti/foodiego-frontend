import type { ReactNode } from 'react';
import { cn } from '../utils/cn';

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  /** Tints the icon chip. Defaults to the brand ember. */
  tone?: 'brand' | 'green' | 'amber' | 'slate';
  className?: string;
}

const TONES: Record<NonNullable<StatCardProps['tone']>, string> = {
  brand: 'bg-brand-50 text-brand-600 ring-brand-200/60',
  green: 'bg-green-50 text-green-600 ring-green-200/60',
  amber: 'bg-amber-50 text-amber-600 ring-amber-200/60',
  slate: 'bg-slate-100 text-slate-500 ring-slate-200/60',
};

/** Compact KPI tile: label, large value, optional icon + hint. */
export function StatCard({ label, value, hint, icon, tone = 'brand', className }: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-soft transition-all duration-200 hover:-translate-y-px hover:shadow-pop',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
        <p className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
        {hint ? <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p> : null}
      </div>
      {icon ? (
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset', TONES[tone])}>
          {icon}
        </span>
      ) : null}
    </div>
  );
}
