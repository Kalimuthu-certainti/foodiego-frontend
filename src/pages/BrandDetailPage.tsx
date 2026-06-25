import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lock, MapPin, Users, Wallet } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Spinner } from '../components/ui/spinner';
import { EmptyState } from '../components/EmptyState';
import { StatCard } from '../components/StatCard';
import { useBrandScope } from '../hooks/useBrandScope';
import { BrandStatusBadge } from '../features/brand/BrandStatusBadge';
import { BranchesTab } from '../features/branch/BranchesTab';
import { StaffTab } from '../features/staff/StaffTab';
import { MenuTab } from '../features/menu/MenuTab';
import { ReportsTab } from '../features/reports/ReportsTab';
import * as brandApi from '../services/brandApi';
import * as restaurantApi from '../services/restaurantApi';
import * as branchApi from '../services/branchApi';
import * as staffApi from '../services/staffApi';
import * as reportApi from '../services/reportApi';
import { QUERY_KEYS } from '../utils/constants';
import { formatCurrency, formatNumber } from '../utils/format';

export default function BrandDetailPage() {
  const { brandId, isLoading: scopeLoading } = useBrandScope();
  const { tab = 'branches' } = useParams<{ tab: string }>();

  const { data: brand, isLoading, isError } = useQuery({
    queryKey: brandId ? QUERY_KEYS.brand(brandId) : ['brands', 'missing'],
    queryFn: () => brandApi.get(brandId as string),
    enabled: Boolean(brandId),
  });

  const { data: restaurants = [] } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId ?? ''),
    queryFn: () => restaurantApi.listByBrand(brandId as string),
    enabled: Boolean(brandId),
  });

  const firstRestaurantId = restaurants[0]?.id;
  const { data: branches = [] } = useQuery({
    queryKey: QUERY_KEYS.branches(firstRestaurantId ?? ''),
    queryFn: () => branchApi.listByRestaurant(firstRestaurantId as string),
    enabled: Boolean(firstRestaurantId),
  });

  const { data: staff = [] } = useQuery({
    queryKey: QUERY_KEYS.staff(brandId ?? ''),
    queryFn: () => staffApi.listByBrand(brandId as string),
    enabled: Boolean(brandId),
  });
  const { data: reportRows = [] } = useQuery({
    queryKey: QUERY_KEYS.reports(brandId ?? '', undefined, undefined),
    queryFn: () => reportApi.reports(brandId as string),
    enabled: Boolean(brandId),
  });

  if (scopeLoading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!brandId) return <Navigate to="/" replace />;
  if (isLoading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (isError || !brand) {
    return (
      <EmptyState
        title="Brand not found"
        description="This brand may have been removed, or you don't have access to it."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Brand header */}
      <div className="flex items-start gap-4 border-b border-slate-100 pb-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 font-display text-xl font-bold text-brand-700">
          {brand.name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold text-slate-900">{brand.name}</h1>
            <BrandStatusBadge status={brand.status} />
            {brand.menu_locked && (
              <Badge variant="muted" className="gap-1">
                <Lock className="h-3 w-3" /> Menu locked
              </Badge>
            )}
            {!brand.is_active && <Badge variant="danger">Inactive</Badge>}
          </div>
          {brand.status === 'rejected' && brand.reject_reason ? (
            <p className="mt-1 text-sm text-red-600">Rejected: {brand.reject_reason}</p>
          ) : (
            <p className="mt-0.5 text-sm text-slate-500">
              Manage branches, staff, and menu
            </p>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Branches"
          value={formatNumber(branches.length)}
          hint={branches.length === 1 ? 'location' : 'locations'}
          icon={<MapPin className="h-5 w-5" />}
          tone="brand"
        />
        <StatCard
          label="Team"
          value={formatNumber(staff.filter((m) => m.status !== 'removed').length)}
          hint="active members"
          icon={<Users className="h-5 w-5" />}
          tone="slate"
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(reportRows.reduce((s, r) => s + r.revenue, 0))}
          hint="all time"
          icon={<Wallet className="h-5 w-5" />}
          tone="green"
        />
      </div>

      {/* Tab content — navigation is in the sidebar */}
      {tab === 'branches' && <BranchesTab brandId={brand.id} />}
      {tab === 'staff'    && <StaffTab brandId={brand.id} />}
      {tab === 'menu'     && <MenuTab brand={brand} />}
      {tab === 'reports'  && <ReportsTab brandId={brand.id} />}
    </div>
  );
}
