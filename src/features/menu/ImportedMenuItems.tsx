import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge, type BadgeVariant } from '../../components/ui/badge';
import { Select } from '../../components/ui/select';
import { DataTable, type Column } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
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

/**
 * Lists menu items imported via Bulk import, ALWAYS scoped to a restaurant. With
 * no restaurants there's nothing to show (items only make sense under a
 * restaurant), so we render an empty state instead of every persisted row.
 */
export function ImportedMenuItems({ brandId }: { brandId: string }) {
  const [restaurantId, setRestaurantId] = useState('');

  const { data: restaurants = [] } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId),
    queryFn: () => restaurantApi.listByBrand(brandId),
  });

  // Default to the first restaurant once they load.
  useEffect(() => {
    if (!restaurantId && restaurants.length > 0) setRestaurantId(restaurants[0].id);
  }, [restaurants, restaurantId]);

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.bulkMenuItems(restaurantId),
    queryFn: () => bulkUploadApi.listMenuItems(restaurantId),
    enabled: Boolean(restaurantId), // never fetch the unscoped "all items" list
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

  // No restaurant exists → don't show any imported items.
  if (restaurants.length === 0) {
    return (
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Imported menu items</h3>
        <EmptyState
          title="No restaurants yet"
          description="Add a restaurant first — then bulk-import its menu and the items appear here."
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">
          Imported menu items{data ? ` (${data.totalItems})` : ''}
        </h3>
        <Select
          aria-label="Restaurant"
          className="h-9 w-56"
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
          options={restaurants.map((r) => ({ value: r.id, label: r.name }))}
        />
      </div>
      <DataTable
        columns={columns}
        data={items}
        rowKey={(i) => String(i.id)}
        isLoading={isLoading}
        emptyTitle="No imported items for this restaurant"
        emptyDescription="Use Bulk import above to upload a CSV/Excel menu file for this restaurant."
      />
    </div>
  );
}
