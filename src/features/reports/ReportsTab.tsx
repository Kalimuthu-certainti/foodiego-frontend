import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, ShoppingBag, Wallet, Receipt, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge, type BadgeVariant } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Spinner } from '../../components/ui/spinner';
import { useToast } from '../../components/ui/toast';
import * as reportApi from '../../services/reportApi';
import { PAYOUT_STATUS_LABELS, QUERY_KEYS } from '../../utils/constants';
import { formatCurrency, formatDate, formatNumber } from '../../utils/format';
import { getErrorMessage } from '../../utils/apiError';
import type { PayoutStatus, ReportRow } from '../../types';

const PAYOUT_VARIANTS: Record<PayoutStatus, BadgeVariant> = { pending: 'warning', paid: 'success' };

// ─── Preset helpers ──────────────────────────────────────────────────────────
type Preset = '7d' | '30d' | '90d' | 'custom';

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}
function presetRange(p: Preset): { from: string; to: string } {
  const today = new Date();
  const from = new Date(today);
  if (p === '7d') from.setDate(today.getDate() - 6);
  else if (p === '30d') from.setDate(today.getDate() - 29);
  else if (p === '90d') from.setDate(today.getDate() - 89);
  return { from: toISO(from), to: toISO(today) };
}

// ─── SVG Trend Chart ─────────────────────────────────────────────────────────
function TrendChart({
  data,
  valueKey,
  color,
  gradId,
}: {
  data: ReportRow[];
  valueKey: 'revenue' | 'orders';
  color: string;
  gradId: string;
}) {
  if (data.length === 0) return <div className="flex h-36 items-center justify-center text-sm text-slate-400">No data</div>;

  const W = 800;
  const H = 140;
  const PAD = { t: 12, r: 8, b: 28, l: 8 };
  const vals = data.map((d) => d[valueKey] as number);
  const maxV = Math.max(...vals, 1);
  const xStep = (W - PAD.l - PAD.r) / Math.max(data.length - 1, 1);
  const yRange = H - PAD.t - PAD.b;

  const pts = data.map((d, i) => ({
    x: PAD.l + i * xStep,
    y: PAD.t + yRange - ((d[valueKey] as number) / maxV) * yRange,
    val: d[valueKey] as number,
    day: d.day,
  }));

  const linePts = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPts = [
    `${pts[0].x},${H - PAD.b}`,
    ...pts.map((p) => `${p.x},${p.y}`),
    `${pts[pts.length - 1].x},${H - PAD.b}`,
  ].join(' ');

  // x-axis label indices (show ~5 labels)
  const step = Math.max(1, Math.floor(data.length / 5));
  const labelIdxs = data.map((_, i) => i).filter((i) => i % step === 0 || i === data.length - 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* grid lines */}
      {[0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.t + (1 - t) * yRange;
        return <line key={t} x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />;
      })}
      <polygon points={areaPts} fill={`url(#${gradId})`} />
      <polyline points={linePts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
      ))}
      {/* x-axis labels */}
      {labelIdxs.map((i) => (
        <text key={i} x={pts[i].x} y={H - 4} textAnchor="middle" fontSize="10" fill="#94a3b8">
          {pts[i].day.slice(5)}
        </text>
      ))}
    </svg>
  );
}

// ─── Mini bar (inline table cell) ────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function Stat({
  label, value, hint, icon, bg, fg,
}: { label: string; value: string; hint?: string; icon: React.ReactNode; bg: string; fg: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        <span className={fg}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="truncate text-xl font-bold text-slate-900">{value}</p>
        {hint && <p className="truncate text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function ReportsTab({ brandId }: { brandId: string }) {
  const toast = useToast();
  const [preset, setPreset] = useState<Preset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [payoutStatus, setPayoutStatus] = useState<'all' | PayoutStatus>('all');
  const [downloading, setDownloading] = useState(false);

  const { from, to } = preset === 'custom'
    ? { from: customFrom, to: customTo }
    : presetRange(preset);

  const { data: rows = [], isLoading: loadingReports } = useQuery({
    queryKey: QUERY_KEYS.reports(brandId, from || undefined, to || undefined),
    queryFn: () => reportApi.reports(brandId, { from: from || undefined, to: to || undefined }),
  });

  const { data: payouts = [], isLoading: loadingPayouts } = useQuery({
    queryKey: QUERY_KEYS.payouts(brandId),
    queryFn: () => reportApi.payouts(brandId),
  });

  const totals = rows.reduce(
    (acc, r) => ({ orders: acc.orders + r.orders, revenue: acc.revenue + r.revenue }),
    { orders: 0, revenue: 0 },
  );
  const avgOrderValue = totals.orders > 0 ? totals.revenue / totals.orders : 0;
  const pendingPayout = payouts.filter((p) => p.status === 'pending').reduce((s, p) => s + (p.net ?? 0), 0);
  const filteredPayouts = payoutStatus === 'all' ? payouts : payouts.filter((p) => p.status === payoutStatus);

  const maxOrders = Math.max(...rows.map((r) => r.orders), 1);
  const maxRevenue = Math.max(...rows.map((r) => r.revenue), 1);

  const exportCsv = async () => {
    setDownloading(true);
    try {
      const csv = await reportApi.payoutsCsv(brandId);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `payouts-${brandId}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not export payouts.'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Date range bar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {(['7d', '30d', '90d'] as Preset[]).map((p) => (
          <button
            key={p}
            onClick={() => setPreset(p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              preset === p
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {p === '7d' ? 'Last 7 days' : p === '30d' ? 'Last 30 days' : 'Last 90 days'}
          </button>
        ))}
        <button
          onClick={() => setPreset('custom')}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            preset === 'custom'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Custom range
        </button>
        {preset === 'custom' && (
          <div className="flex items-center gap-2 ml-1">
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="h-9 w-38" />
            <span className="text-slate-400 text-sm">→</span>
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="h-9 w-38" />
          </div>
        )}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total Orders" value={formatNumber(totals.orders)}
          hint={from && to ? `${from} → ${to}` : 'Selected range'}
          icon={<ShoppingBag className="h-5 w-5" />} bg="bg-brand-50" fg="text-brand-600" />
        <Stat label="Total Revenue" value={formatCurrency(totals.revenue)}
          hint={from && to ? `${from} → ${to}` : 'Selected range'}
          icon={<Wallet className="h-5 w-5" />} bg="bg-green-50" fg="text-green-600" />
        <Stat label="Avg Order Value" value={formatCurrency(avgOrderValue)}
          icon={<Receipt className="h-5 w-5" />} bg="bg-blue-50" fg="text-blue-600" />
        <Stat label="Pending Payout" value={formatCurrency(pendingPayout)}
          hint="Awaiting settlement"
          icon={<Clock className="h-5 w-5" />} bg="bg-amber-50" fg="text-amber-600" />
      </div>

      {/* ── Charts ── */}
      {loadingReports ? (
        <div className="flex h-40 items-center justify-center"><Spinner className="h-6 w-6 text-slate-400" /></div>
      ) : rows.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Revenue Trend</p>
            <TrendChart data={rows} valueKey="revenue" color="#16a34a" gradId="rev-grad" />
          </div>
          <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Orders Trend</p>
            <TrendChart data={rows} valueKey="orders" color="#2563eb" gradId="ord-grad" />
          </div>
        </div>
      ) : null}

      {/* ── Daily table ── */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Daily Breakdown</p>
          {rows.length > 0 && (
            <p className="text-xs text-slate-500">
              <span className="font-medium text-slate-900">{formatNumber(totals.orders)}</span> orders ·{' '}
              <span className="font-medium text-slate-900">{formatCurrency(totals.revenue)}</span>
            </p>
          )}
        </div>

        {loadingReports ? (
          <div className="flex h-24 items-center justify-center"><Spinner className="h-5 w-5 text-slate-400" /></div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No data for this range.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-2.5 text-left">Date</th>
                  <th className="px-4 py-2.5 text-right">Orders</th>
                  <th className="px-4 py-2.5 text-left w-28"></th>
                  <th className="px-4 py-2.5 text-right">Revenue</th>
                  <th className="px-4 py-2.5 text-left w-28"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => (
                  <tr key={r.day} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-700">{formatDate(r.day)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-900">{formatNumber(r.orders)}</td>
                    <td className="px-4 py-2.5"><MiniBar value={r.orders} max={maxOrders} color="#2563eb" /></td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-900">{formatCurrency(r.revenue)}</td>
                    <td className="px-4 py-2.5"><MiniBar value={r.revenue} max={maxRevenue} color="#16a34a" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Payouts ── */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Payouts</p>
          <div className="flex items-center gap-2">
            <Select
              aria-label="Filter payouts"
              className="h-9 w-40"
              value={payoutStatus}
              onChange={(e) => setPayoutStatus(e.target.value as 'all' | PayoutStatus)}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'pending', label: PAYOUT_STATUS_LABELS.pending },
                { value: 'paid', label: PAYOUT_STATUS_LABELS.paid },
              ]}
            />
            <Button variant="outline" onClick={exportCsv} disabled={downloading || payouts.length === 0}>
              {downloading ? <Spinner className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              Export CSV
            </Button>
          </div>
        </div>

        {loadingPayouts ? (
          <div className="flex h-24 items-center justify-center"><Spinner className="h-5 w-5 text-slate-400" /></div>
        ) : filteredPayouts.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            {payoutStatus === 'all' ? 'No payouts yet.' : 'No payouts match this filter.'}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredPayouts.map((p) => {
              const feeRatio = p.gross > 0 ? p.fee / p.gross : 0;
              return (
                <div key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors">
                  <div className="w-28 shrink-0">
                    <p className="text-sm font-semibold text-slate-800">{p.period}</p>
                    <Badge variant={PAYOUT_VARIANTS[p.status]} className="mt-1">
                      {PAYOUT_STATUS_LABELS[p.status]}
                    </Badge>
                  </div>

                  <div className="flex flex-1 gap-6 min-w-0">
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Gross</p>
                      <p className="text-sm tabular-nums text-slate-700">{formatCurrency(p.gross)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Fee</p>
                      <p className="text-sm tabular-nums text-red-500">−{formatCurrency(p.fee)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-0.5">Net</p>
                      <p className="text-sm tabular-nums font-semibold text-slate-900">{formatCurrency(p.net)}</p>
                    </div>
                  </div>

                  {/* fee visual breakdown bar */}
                  <div className="w-36 shrink-0">
                    <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-brand-500" style={{ width: `${(1 - feeRatio) * 100}%` }} />
                      <div className="h-full bg-red-300" style={{ width: `${feeRatio * 100}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {Math.round((1 - feeRatio) * 100)}% net · {Math.round(feeRatio * 100)}% fee
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
