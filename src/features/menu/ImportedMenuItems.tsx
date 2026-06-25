import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, type BadgeVariant } from '../../components/ui/badge';
import { Select } from '../../components/ui/select';
import { DataTable, type Column } from '../../components/DataTable';
import * as restaurantApi from '../../services/restaurantApi';
import * as bulkUploadApi from '../../services/bulkUploadApi';
import type { BulkMenuItem } from '../../services/bulkUploadApi';
import { QUERY_KEYS } from '../../utils/constants';
import { formatCurrency } from '../../utils/format';

const FOOD_TYPE_VARIANTS: Record<string, BadgeVariant> = {
  Veg: 'success',
  'Non-Veg': 'danger',
  Egg: 'warning',
};

/** Lists menu items imported via Bulk import (from the bulk-upload module / Postgres). */
export function ImportedMenuItems({ brandId }: { brandId: string }) {
  const [restaurantId, setRestaurantId] = useState('');

  const { data: restaurants = [] } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId),
    queryFn: () => restaurantApi.listByBrand(brandId),
  });

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.bulkMenuItems(restaurantId || undefined),
    queryFn: () => bulkUploadApi.listMenuItems(restaurantId || undefined),
  });

  const items = data?.items ?? [];

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
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">
          Imported menu items{data ? ` (${data.totalItems})` : ''}
        </h3>
        <Select
          aria-label="Filter imported items by restaurant"
          className="h-9 w-56"
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
        >
          <option value="">All restaurants</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={items}
        rowKey={(i) => String(i.id)}
        isLoading={isLoading}
        emptyTitle="No imported items yet"
        emptyDescription="Use Bulk import above to upload a CSV/Excel menu file."
      />
    </div>
  );
}
