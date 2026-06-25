import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '../components/ui/spinner';
import { DataTable, type Column } from '../components/DataTable';
import { EmptyState } from '../components/EmptyState';
import { BrandStatusBadge } from '../features/brand/BrandStatusBadge';
import { useSelectedBrand } from '../store/selectedBrand';
import * as brandApi from '../services/brandApi';
import { QUERY_KEYS } from '../utils/constants';
import { formatDate } from '../utils/format';
import type { Brand } from '../types';

export default function BrandListPage() {
  const navigate = useNavigate();
  const { selectBrand } = useSelectedBrand();

  const { data: brands = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.brands,
    queryFn: brandApi.list,
  });

  // Single brand — auto-select and go straight to managing it.
  useEffect(() => {
    if (brands.length === 1) {
      selectBrand(brands[0].id);
      navigate('/restaurants', { replace: true });
    }
  }, [brands, selectBrand, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <EmptyState
        title="No brand assigned yet"
        description="Your brand is set up and approved by an administrator. Once that's done, it will appear here."
      />
    );
  }

  // Multiple brands — show a list.
  const columns: Column<Brand>[] = [
    { key: 'name', header: 'Name', cell: (b) => <span className="font-medium text-slate-900">{b.name}</span> },
    { key: 'status', header: 'Status', cell: (b) => <BrandStatusBadge status={b.status} /> },
    { key: 'created_at', header: 'Created', cell: (b) => <span className="text-slate-500">{formatDate(b.created_at)}</span> },
  ];

  const handleSelect = (b: Brand) => {
    selectBrand(b.id);
    navigate('/restaurants');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Your Brands</h1>
        <p className="text-sm text-slate-500">Select a brand to manage.</p>
      </div>
      <DataTable columns={columns} data={brands} rowKey={(b) => b.id} onRowClick={handleSelect} />
    </div>
  );
}
