import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select } from '../../components/ui/select';
import { Spinner } from '../../components/ui/spinner';
import { FormField } from '../../components/FormField';
import { EmptyState } from '../../components/EmptyState';
import { DataTable, type Column } from '../../components/DataTable';
import { BranchFormDialog } from './BranchFormDialog';
import * as restaurantApi from '../../services/restaurantApi';
import * as branchApi from '../../services/branchApi';
import { QUERY_KEYS } from '../../utils/constants';
import { formatCoords, formatWorkingHours } from '../../utils/format';
import type { Branch } from '../../types';

/** Brand-detail "Branches" tab: pick a restaurant, then list/add its branches. */
export function BranchesTab({ brandId }: { brandId: string }) {
  const [restaurantId, setRestaurantId] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const { data: restaurants = [], isLoading: loadingRestaurants } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId),
    queryFn: () => restaurantApi.listByBrand(brandId),
  });

  // Default the selection to the first restaurant once they load.
  useEffect(() => {
    if (!restaurantId && restaurants.length > 0) setRestaurantId(restaurants[0].id);
  }, [restaurants, restaurantId]);

  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: QUERY_KEYS.branches(restaurantId),
    queryFn: () => branchApi.listByRestaurant(restaurantId),
    enabled: Boolean(restaurantId),
  });

  if (loadingRestaurants) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <EmptyState
        title="No restaurants yet"
        description="Add a restaurant in the Restaurants tab before configuring branches."
      />
    );
  }

  const columns: Column<Branch>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (b) => <span className="font-medium text-slate-900">{b.name}</span>,
    },
    {
      key: 'coords',
      header: 'Location',
      cell: (b) => <span className="text-slate-600">{formatCoords(b.lat, b.lng)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (b) => (
        <Badge variant={b.is_open ? 'success' : 'muted'}>{b.is_open ? 'Open' : 'Closed'}</Badge>
      ),
    },
    {
      key: 'hours',
      header: 'Working hours',
      cell: (b) => (
        <span className="whitespace-pre-line text-xs text-slate-500">
          {formatWorkingHours(b.working_hours)}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <FormField label="Restaurant" htmlFor="branch-restaurant" className="w-full max-w-xs">
          <Select
            id="branch-restaurant"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            options={restaurants.map((r) => ({ value: r.id, label: r.name }))}
          />
        </FormField>
        <Button onClick={() => setFormOpen(true)} disabled={!restaurantId}>
          <Plus className="h-4 w-4" />
          Add branch
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={branches}
        rowKey={(b) => b.id}
        isLoading={loadingBranches}
        emptyTitle="No branches yet"
        emptyDescription="Add a branch with its location and opening hours."
        emptyAction={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" />
            Add branch
          </Button>
        }
      />

      {restaurantId ? (
        <BranchFormDialog
          restaurantId={restaurantId}
          open={formOpen}
          onOpenChange={setFormOpen}
        />
      ) : null}
    </div>
  );
}
