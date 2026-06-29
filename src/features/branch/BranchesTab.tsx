import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Pencil, Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { EmptyState } from '../../components/EmptyState';
import { DataTable, type Column } from '../../components/DataTable';
import { BranchFormDialog } from './BranchFormDialog';
import * as restaurantApi from '../../services/restaurantApi';
import * as branchApi from '../../services/branchApi';
import { QUERY_KEYS } from '../../utils/constants';
import { formatCoords, formatWorkingHours } from '../../utils/format';
import type { Branch } from '../../types';

export function BranchesTab({ brandId }: { brandId: string }) {
  const [restaurantId, setRestaurantId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const { data: restaurants = [], isLoading: loadingRestaurants } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId),
    queryFn: () => restaurantApi.listByBrand(brandId),
  });

  // Auto-select the first (and typically only) restaurant silently — no picker shown.
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
      <div className="flex flex-col gap-5">
        <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="flex gap-4 border-b border-slate-100 px-4 py-3.5 last:border-0">
              <div className="h-3.5 w-1/4 animate-pulse rounded-md bg-slate-100" />
              <div className="h-3.5 w-1/3 animate-pulse rounded-md bg-slate-100" />
              <div className="h-3.5 w-1/6 animate-pulse rounded-md bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <EmptyState
        title="No outlet configured yet"
        description="Your restaurant outlet will be set up by an administrator."
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
    {
      key: 'actions',
      header: '',
      cell: (b) => (
        <button
          onClick={() => { setEditingBranch(b); setFormOpen(true); }}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label={`Edit ${b.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Branches</h2>
          <p className="mt-0.5 text-sm text-slate-500">Locations and opening hours for each outlet</p>
        </div>
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

      {restaurantId && (
        <BranchFormDialog
          restaurantId={restaurantId}
          branch={editingBranch ?? undefined}
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditingBranch(null);
          }}
        />
      )}
    </div>
  );
}
