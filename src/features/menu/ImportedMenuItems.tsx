import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge, type BadgeVariant } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { DataTable, type Column } from '../../components/DataTable';
import * as bulkUploadApi from '../../services/bulkUploadApi';
import type { BulkMenuItem } from '../../services/bulkUploadApi';
import { QUERY_KEYS } from '../../utils/constants';
import { formatCurrency } from '../../utils/format';

const PAGE_SIZE = 15;

const FOOD_TYPE_VARIANTS: Record<string, BadgeVariant> = {
  Veg: 'success',
  'Non-Veg': 'danger',
  Egg: 'warning',
};

export function ImportedMenuItems({ brandId: _brandId }: { brandId: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.bulkMenuItems(undefined),
    queryFn: () => bulkUploadApi.listMenuItems(),
  });

  const items = data?.items ?? [];
  const totalItems = data?.totalItems ?? 0;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const rangeStart = items.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, items.length);

  const columns: Column<BulkMenuItem>[] = [
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
        <Badge variant={i.status === 'active' ? 'success' : 'muted'}>{i.status}</Badge>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-700">
        Imported menu items{totalItems > 0 ? ` (${totalItems})` : ''}
      </p>

      <DataTable
        columns={columns}
        data={pageItems}
        rowKey={(i) => String(i.id)}
        isLoading={isLoading}
        emptyTitle="No imported items yet"
        emptyDescription="Use Bulk import above to upload a CSV/Excel menu file."
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
