import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Download, Receipt, ShoppingBag, Wallet } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge, type BadgeVariant } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Spinner } from '../../components/ui/spinner';
import { FormField } from '../../components/FormField';
import { StatCard } from '../../components/StatCard';
import { DataTable, type Column } from '../../components/DataTable';
import { useToast } from '../../components/ui/toast';
import * as reportApi from '../../services/reportApi';
import { PAYOUT_STATUS_LABELS, QUERY_KEYS } from '../../utils/constants';
import { formatCurrency, formatDate, formatNumber } from '../../utils/format';
import { getErrorMessage } from '../../utils/apiError';
import type { Payout, PayoutStatus, ReportRow } from '../../types';

const PAYOUT_VARIANTS: Record<PayoutStatus, BadgeVariant> = {
  pending: 'warning',
  paid: 'success',
};

/** Brand-detail "Reports" tab: order/revenue rows plus payouts with CSV export. */
export function ReportsTab({ brandId }: { brandId: string }) {
  const toast = useToast();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [payoutStatus, setPayoutStatus] = useState<'all' | PayoutStatus>('all');
  const [downloading, setDownloading] = useState(false);

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

  const filteredPayouts =
    payoutStatus === 'all' ? payouts : payouts.filter((p) => p.status === payoutStatus);

  const avgOrderValue = totals.orders > 0 ? totals.revenue / totals.orders : 0;
  const pendingPayout = payouts
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + (p.net ?? 0), 0);

  const exportCsv = async () => {
    setDownloading(true);
    try {
      const csv = await reportApi.payoutsCsv(brandId);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payouts-${brandId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not export payouts.'));
    } finally {
      setDownloading(false);
    }
  };

  const reportColumns: Column<ReportRow>[] = [
    { key: 'day', header: 'Day', cell: (r) => <span className="text-slate-900">{formatDate(r.day)}</span> },
    {
      key: 'orders',
      header: 'Orders',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (r) => <span className="tabular-nums text-slate-900">{formatNumber(r.orders)}</span>,
    },
    {
      key: 'revenue',
      header: 'Revenue',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (r) => <span className="tabular-nums text-slate-900">{formatCurrency(r.revenue)}</span>,
    },
  ];

  const payoutColumns: Column<Payout>[] = [
    { key: 'period', header: 'Period', cell: (p) => <span className="text-slate-900">{p.period}</span> },
    {
      key: 'gross',
      header: 'Gross',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (p) => <span className="tabular-nums text-slate-600">{formatCurrency(p.gross)}</span>,
    },
    {
      key: 'fee',
      header: 'Fee',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (p) => <span className="tabular-nums text-slate-600">{formatCurrency(p.fee)}</span>,
    },
    {
      key: 'net',
      header: 'Net',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (p) => <span className="tabular-nums font-medium text-slate-900">{formatCurrency(p.net)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (p) => <Badge variant={PAYOUT_VARIANTS[p.status]}>{PAYOUT_STATUS_LABELS[p.status]}</Badge>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Reports</h2>
          <p className="mt-0.5 text-sm text-slate-500">Revenue, orders, and payout history</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Orders"
          value={formatNumber(totals.orders)}
          hint={from || to ? 'Selected range' : 'All time'}
          icon={<ShoppingBag className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(totals.revenue)}
          hint={from || to ? 'Selected range' : 'All time'}
          icon={<Wallet className="h-5 w-5" />}
          tone="green"
        />
        <StatCard
          label="Avg order value"
          value={formatCurrency(avgOrderValue)}
          icon={<Receipt className="h-5 w-5" />}
          tone="slate"
        />
        <StatCard
          label="Pending payout"
          value={formatCurrency(pendingPayout)}
          hint="Awaiting settlement"
          icon={<Clock className="h-5 w-5" />}
          tone="amber"
        />
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700">Daily breakdown</p>
          <div className="flex flex-wrap items-end gap-3">
            <FormField label="From" htmlFor="report-from" className="w-36">
              <Input id="report-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </FormField>
            <FormField label="To" htmlFor="report-to" className="w-36">
              <Input id="report-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </FormField>
          </div>
        </div>
        {rows.length > 0 ? (
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-900">{formatNumber(totals.orders)}</span> orders ·{' '}
            <span className="font-medium text-slate-900">{formatCurrency(totals.revenue)}</span> revenue in range
          </p>
        ) : null}
        <DataTable
          columns={reportColumns}
          data={rows}
          rowKey={(r) => r.day}
          isLoading={loadingReports}
          emptyTitle="No report data"
          emptyDescription="Orders and revenue will appear here for the selected range."
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700">Payouts</p>
          <div className="flex items-center gap-2">
            <Select
              aria-label="Filter payouts by status"
              className="h-9 w-40"
              value={payoutStatus}
              onChange={(e) => setPayoutStatus(e.target.value as 'all' | PayoutStatus)}
              options={[
                { value: 'all', label: 'All statuses' },
                { value: 'pending', label: PAYOUT_STATUS_LABELS.pending },
                { value: 'paid', label: PAYOUT_STATUS_LABELS.paid },
              ]}
            />
            <Button
              variant="outline"
              onClick={exportCsv}
              disabled={downloading || payouts.length === 0}
            >
              {downloading ? <Spinner className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              Export CSV
            </Button>
          </div>
        </div>
        <DataTable
          columns={payoutColumns}
          data={filteredPayouts}
          rowKey={(p) => p.id}
          isLoading={loadingPayouts}
          emptyTitle={payoutStatus === 'all' ? 'No payouts yet' : 'No payouts match this filter'}
          emptyDescription={
            payoutStatus === 'all'
              ? 'Settled payouts for this brand will be listed here.'
              : 'Try a different status.'
          }
        />
      </section>
    </div>
  );
}
