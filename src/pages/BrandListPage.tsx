import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '../components/ui/spinner';
import { DataTable, type Column } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { BrandStatusBadge } from '../features/brand/BrandStatusBadge';
import * as brandApi from '../services/brandApi';
import { QUERY_KEYS } from '../utils/constants';
import { formatDate } from '../utils/format';
import type { Brand } from '../types';

/**
 * Landing after login. Brands are provisioned and approved by an admin — the
 * owner does not create them here. The common case is a single brand, so we
 * redirect straight into it; a list is only shown if an owner has several.
 */
export default function BrandListPage() {
  const navigate = useNavigate();

  const { data: brands = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.brands,
    queryFn: brandApi.list,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  // No brand assigned yet — an admin sets this up; nothing for the owner to do here.
  if (brands.length === 0) {
    return (
      <EmptyState
        title="No brand assigned yet"
        description="Your brand is set up and approved by an administrator. Once that's done, it will appear here and you can start adding restaurants. Please contact your administrator."
      />
    );
  }

  // Single brand (the usual case): go straight to managing it.
  if (brands.length === 1) {
    return <Navigate to={`/brands/${brands[0].id}`} replace />;
  }

  const columns: Column<Brand>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (b) => <span className="font-medium text-slate-900">{b.name}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (b) => <BrandStatusBadge status={b.status} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      cell: (b) => <span className="text-slate-500">{formatDate(b.created_at)}</span>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Brands</h1>
        <p className="text-sm text-slate-500">Select a brand to manage its restaurants and payouts.</p>
      </div>

      <DataTable
        columns={columns}
        data={brands}
        rowKey={(b) => b.id}
        onRowClick={(b) => navigate(`/brands/${b.id}`)}
      />
    </div>
  );
}
