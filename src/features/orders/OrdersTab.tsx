import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChefHat,
  Clock,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';
import { StatCard } from '../../components/StatCard';
import { DataTable, type Column } from '../../components/DataTable';
import { Badge, type BadgeVariant } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { useToast } from '../../components/ui/toast';
import { CancelOrderDialog } from './CancelOrderDialog';
import * as ordersApi from '../../services/ordersApi';
import * as restaurantApi from '../../services/restaurantApi';
import * as branchApi from '../../services/branchApi';
import {
  CANCELLABLE_STATUSES,
  ORDER_STATUS_LABELS,
  QUERY_KEYS,
} from '../../utils/constants';
import { formatCurrency, formatNumber, formatRelativeTime } from '../../utils/format';
import type { Order, OrderFilters, OrderStatus } from '../../types';

const STATUS_BADGE: Record<OrderStatus, BadgeVariant> = {
  placed: 'warning',
  confirmed: 'info',
  preparing: 'orange',
  out_for_delivery: 'purple',
  delivered: 'success',
  cancelled: 'danger',
};

const PAGE_LIMIT = 10;

export function OrdersTab({ brandId }: { brandId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [branchId, setBranchId] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  // Silently resolve the first restaurant to get branches for the filter
  const { data: restaurants = [] } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId),
    queryFn: () => restaurantApi.listByBrand(brandId),
  });
  const firstRestaurantId = restaurants[0]?.id;

  const { data: branches = [] } = useQuery({
    queryKey: QUERY_KEYS.branches(firstRestaurantId ?? ''),
    queryFn: () => branchApi.listByRestaurant(firstRestaurantId as string),
    enabled: Boolean(firstRestaurantId),
  });

  // Summary counts
  const { data: summaryData } = useQuery({
    queryKey: QUERY_KEYS.orderSummary(brandId),
    queryFn: ordersApi.summary,
  });

  // Active filters object (only set keys with real values)
  const activeFilters: OrderFilters = {
    ...(branchId  && { branch_id: branchId }),
    ...(status    && { status }),
    ...(fromDate  && { from: fromDate }),
    ...(toDate    && { to: toDate }),
    ...(search    && { search }),
    page,
    limit: PAGE_LIMIT,
  };

  const { data: ordersData, isLoading } = useQuery({
    queryKey: QUERY_KEYS.orders(brandId, activeFilters as Record<string, unknown>),
    queryFn: () => ordersApi.list(activeFilters),
  });

  const orders = ordersData?.orders ?? [];
  const total = ordersData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  function clearFilters() {
    setBranchId('');
    setStatus('');
    setFromDate('');
    setToDate('');
    setSearch('');
    setPage(1);
  }

  const hasFilters = Boolean(branchId || status || fromDate || toDate || search);

  const columns: Column<Order>[] = [
    {
      key: 'order_number',
      header: 'Order #',
      cell: (o) => (
        <span className="font-mono text-sm font-semibold text-slate-900">
          {o.order_number}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      cell: (o) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{o.customer_name ?? '—'}</span>
          {o.customer_phone && (
            <span className="text-xs text-slate-500">{o.customer_phone}</span>
          )}
        </div>
      ),
    },
    {
      key: 'branch',
      header: 'Branch',
      cell: (o) => <span className="text-slate-600">{o.branch_name ?? '—'}</span>,
    },
    {
      key: 'items',
      header: 'Items',
      cell: (o) => <span className="text-slate-900">{o.items.length}</span>,
    },
    {
      key: 'total_amount',
      header: 'Amount',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (o) => (
        <span className="tabular-nums text-slate-900">
          {formatCurrency(o.total_amount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (o) => (
        <Badge variant={STATUS_BADGE[o.status]}>
          {ORDER_STATUS_LABELS[o.status]}
        </Badge>
      ),
    },
    {
      key: 'placed_at',
      header: 'Placed',
      cell: (o) => (
        <span className="text-xs text-slate-500">{formatRelativeTime(o.placed_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      headClassName: 'text-right',
      className: 'text-right',
      cell: (o) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/orders/${o.id}`)}
          >
            View
          </Button>
          {CANCELLABLE_STATUSES.includes(o.status) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setCancelTarget(o)}
            >
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Orders</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Track and manage customer orders
          </p>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Placed"
          value={formatNumber(summaryData?.placed_count ?? 0)}
          icon={<Clock className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Confirmed"
          value={formatNumber(summaryData?.confirmed_count ?? 0)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Preparing"
          value={formatNumber(summaryData?.preparing_count ?? 0)}
          icon={<ChefHat className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard
          label="Out for Delivery"
          value={formatNumber(summaryData?.out_for_delivery_count ?? 0)}
          icon={<Truck className="h-5 w-5" />}
          tone="slate"
        />
        <StatCard
          label="Delivered"
          value={formatNumber(summaryData?.delivered_count ?? 0)}
          icon={<Package className="h-5 w-5" />}
          tone="green"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-40">
          <Select
            value={branchId}
            onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
            aria-label="Filter by branch"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </div>
        <div className="w-44">
          <Select
            value={status}
            onChange={(e) => { setStatus(e.target.value as OrderStatus | ''); setPage(1); }}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            aria-label="From date"
            className="w-36"
          />
          <span className="text-xs text-slate-400">to</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            aria-label="To date"
            className="w-36"
          />
        </div>
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search order # or customer…"
          aria-label="Search orders"
          className="w-52"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <XCircle className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Orders table */}
      <DataTable
        columns={columns}
        data={orders}
        rowKey={(o) => o.id}
        isLoading={isLoading}
        emptyTitle="No orders found"
        emptyDescription={
          hasFilters
            ? 'Try adjusting your filters.'
            : 'Customer orders will appear here once placed.'
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 text-sm">
          <span className="text-slate-500">
            {total} order{total !== 1 ? 's' : ''} total
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="min-w-[4rem] text-center tabular-nums text-slate-600">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Cancel dialog */}
      {cancelTarget && (
        <CancelOrderDialog
          orderId={cancelTarget.id}
          orderNumber={cancelTarget.order_number}
          open={Boolean(cancelTarget)}
          onOpenChange={(open) => { if (!open) setCancelTarget(null); }}
          onCancelled={(updated) => {
            queryClient.setQueryData(
              QUERY_KEYS.order(cancelTarget.id),
              updated,
            );
            queryClient.invalidateQueries({ queryKey: ['orders', brandId] });
            setCancelTarget(null);
            toast.success('Order cancelled successfully.');
          }}
        />
      )}
    </div>
  );
}
