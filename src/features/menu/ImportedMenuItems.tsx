import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge, type BadgeVariant } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { DataTable, type Column } from '../../components/DataTable';
import * as bulkUploadApi from '../../services/bulkUploadApi';
import * as restaurantApi from '../../services/restaurantApi';
import * as branchApi from '../../services/branchApi';
import type { BulkMenuItem } from '../../services/bulkUploadApi';
import { QUERY_KEYS } from '../../utils/constants';
import { formatCurrency } from '../../utils/format';
import { cn } from '../../utils/cn';

const PAGE_SIZE = 15;

const FOOD_TYPE_VARIANTS: Record<string, BadgeVariant> = {
  Veg: 'success',
  'Non-Veg': 'danger',
  Egg: 'warning',
};

const STATUS_TABS = [
  { value: '',                 label: 'All Requests' },
  { value: 'pending_approval', label: 'Pending' },
  { value: 'approved',         label: 'Approved' },
  { value: 'rejected',         label: 'Rejected' },
  { value: 'partial',          label: 'Partial' },
] as const;

const STATUS_VARIANTS: Record<string, BadgeVariant> = {
  pending_approval: 'warning',
  approved:         'success',
  rejected:         'danger',
  partial:          'info',
};

const STATUS_LABELS: Record<string, string> = {
  pending_approval: 'Pending',
  approved:         'Approved',
  rejected:         'Rejected',
  partial:          'Partial',
};

export function ImportedMenuItems({ brandId }: { brandId: string }) {
  const [page, setPage] = useState(1);
  const [branchId, setBranchId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.bulkMenuItems(branchId || undefined, statusFilter || undefined),
    queryFn: () => bulkUploadApi.listMenuItems(branchId || undefined, statusFilter || undefined),
  });

  const items = data?.items ?? [];
  const totalItems = data?.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = items.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, items.length);

  const columns: Column<BulkMenuItem>[] = [
    {
      key: 'sno',
      header: 'S.No',
      headClassName: 'w-12',
      cell: (i) => (
        <span className="tabular-nums text-slate-400">
          {(page - 1) * PAGE_SIZE + pageItems.indexOf(i) + 1}
        </span>
      ),
    },
    {
      key: 'item_name',
      header: 'Item',
      cell: (i) => <span className="font-medium text-slate-900">{i.item_name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      cell: (i) => (
        <span className="text-slate-600">
          {i.category}
          {i.sub_category ? <span className="text-slate-400"> · {i.sub_category}</span> : null}
        </span>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      headClassName: 'text-right',
      className: 'text-right',
      cell: (i) => <span className="tabular-nums text-slate-900">{formatCurrency(Number(i.price))}</span>,
    },
    {
      key: 'food_type',
      header: 'Type',
      cell: (i) => <Badge variant={FOOD_TYPE_VARIANTS[i.food_type] ?? 'default'}>{i.food_type}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (i) => (
        <Badge variant={STATUS_VARIANTS[i.status] ?? 'muted'}>
          {STATUS_LABELS[i.status] ?? i.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Header row: title + branch filter */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">
          Imported menu items{totalItems > 0 ? ` (${totalItems})` : ''}
        </p>
        <Select
          value={branchId}
          onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
          aria-label="Filter by branch"
          className="w-52"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={cn(
              'rounded-full px-3.5 py-1 text-xs font-medium transition-all',
              statusFilter === tab.value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={pageItems}
        rowKey={(i) => String(i.id)}
        isLoading={isLoading}
        emptyTitle="No items found"
        emptyDescription={statusFilter ? 'No items match the selected status.' : 'Use Bulk import above to upload a CSV/Excel menu file.'}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 text-sm">
          <span className="text-slate-500">
            {rangeStart}–{rangeEnd} of {items.length} items
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
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
              aria-label="Next page"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
