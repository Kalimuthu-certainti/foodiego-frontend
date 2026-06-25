import { useQuery } from '@tanstack/react-query';
import { DataTable, type Column } from '../../components/DataTable';
import * as restaurantApi from '../../services/restaurantApi';
import { QUERY_KEYS } from '../../utils/constants';
import { formatDate } from '../../utils/format';
import type { Restaurant } from '../../types';

/** Brand-detail "Restaurants" tab: shows restaurants registered under this brand (read-only). */
export function RestaurantsTab({ brandId }: { brandId: string }) {
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
    { key: 'gst_no', header: 'GST', cell: (r) => <span className="text-slate-600">{r.gst_no ?? '—'}</span> },
    { key: 'email', header: 'Email', cell: (r) => <span className="text-slate-600">{r.email ?? '—'}</span> },
    { key: 'phone', header: 'Phone', cell: (r) => <span className="text-slate-600">{r.phone}</span> },
    {
      key: 'created_at',
      header: 'Added',
      cell: (r) => <span className="text-slate-500">{formatDate(r.created_at)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Restaurants</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Outlets registered under this brand. To add a new location, go to <strong>Branches</strong>.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={restaurants}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyTitle="No restaurants yet"
        emptyDescription="Your restaurant will appear here once it has been set up. Add a branch to get started."
      />
    </div>
  );
}
