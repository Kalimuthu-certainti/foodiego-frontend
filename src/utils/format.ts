// Formatting helpers for display.

import type { WorkingHours, DayKey } from '../types';
import { DAY_KEYS, DAY_LABELS } from './constants';

/** Format an ISO date string as a short local date, e.g. "18 Jun 2026". */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Format an ISO date string as a local date + time. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Format a number as a currency amount (INR by default). */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency = 'INR',
): string {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  if (n == null || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Format a plain integer with grouping, e.g. 12345 -> "12,345". */
export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat().format(value);
}

/** Format a lat/lng coordinate pair for display. */
export function formatCoords(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Summarise a working_hours JSONB object as a human-readable multi-line string,
 * e.g. "Mon: 10:00–22:00 / Sun: Closed". Empty/absent day = "Closed".
 */
export function formatWorkingHours(hours: WorkingHours | null | undefined): string {
  if (!hours) return 'Closed all week';
  return DAY_KEYS.map((day: DayKey) => {
    const slots = hours[day];
    const label = DAY_LABELS[day].slice(0, 3);
    if (!slots || slots.length === 0) return `${label}: Closed`;
    const ranges = slots.map((s) => `${s.open}–${s.close}`).join(', ');
    return `${label}: ${ranges}`;
  }).join('\n');
}

/** Truncate text to a max length with an ellipsis. */
export function truncate(text: string, max = 40): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

/**
 * Format a timestamp as relative time for recent dates ("2 mins ago", "1 hour ago")
 * and as a full date for older ones ("24 Jun 2026, 2:30 PM").
 */
export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDateTime(iso);
}
