import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { DataTable, type Column } from '../../components/DataTable';
import { RestaurantFormDialog } from './RestaurantFormDialog';
import * as restaurantApi from '../../services/restaurantApi';
import { QUERY_KEYS } from '../../utils/constants';
import { formatDate } from '../../utils/format';
import type { Restaurant } from '../../types';

/** Brand-detail "Restaurants" tab: lists restaurants and adds new ones. */
export function RestaurantsTab({ brandId }: { brandId: string }) {
  const [formOpen, setFormOpen] = useState(false);

  const { data: restaurants = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId),
    queryFn: () => restaurantApi.listByBrand(brandId),
  });

  const columns: Column<Restaurant>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (r) => <span className="font-medium text-slate-900">{r.name}</span>,
    },
    { key: 'gst_no', header: 'GST', cell: (r) => <span className="text-slate-600">{r.gst_no}</span> },
    { key: 'email', header: 'Email', cell: (r) => <span className="text-slate-600">{r.email}</span> },
    { key: 'phone', header: 'Phone', cell: (r) => <span className="text-slate-600">{r.phone}</span> },
    {
      key: 'created_at',
      header: 'Added',
      cell: (r) => <span className="text-slate-500">{formatDate(r.created_at)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Restaurants</h2>
          <p className="mt-0.5 text-sm text-slate-500">Physical outlets operating under this brand</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add restaurant
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={restaurants}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyTitle="No restaurants yet"
        emptyDescription="Add a restaurant to start configuring its branches."
        emptyAction={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Add restaurant
          </Button>
        }
      />

      <RestaurantFormDialog brandId={brandId} open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
