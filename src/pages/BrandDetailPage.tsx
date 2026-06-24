import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Lock, Store, Users, Wallet } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Spinner } from '../components/ui/spinner';
import { EmptyState } from '../components/EmptyState';
import { StatCard } from '../components/StatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useBrandScope } from '../hooks/useBrandScope';
import { BrandStatusBadge } from '../features/brand/BrandStatusBadge';
import { RestaurantsTab } from '../features/restaurant/RestaurantsTab';
import { BranchesTab } from '../features/branch/BranchesTab';
import { StaffTab } from '../features/staff/StaffTab';
import { MenuTab } from '../features/menu/MenuTab';
import { ReportsTab } from '../features/reports/ReportsTab';
import * as brandApi from '../services/brandApi';
import * as restaurantApi from '../services/restaurantApi';
import * as staffApi from '../services/staffApi';
import * as reportApi from '../services/reportApi';
import { QUERY_KEYS } from '../utils/constants';
import { formatCurrency, formatNumber } from '../utils/format';

const TABS = [
  { value: 'restaurants', label: 'Restaurants' },
  { value: 'branches', label: 'Branches' },
  { value: 'staff', label: 'Staff' },
  { value: 'menu', label: 'Menu' },
  { value: 'reports', label: 'Reports' },
] as const;

/** Single-brand workspace: header + tabbed management surfaces. */
export default function BrandDetailPage() {
  const { brandId } = useBrandScope();
  const [tab, setTab] = useState<string>('restaurants');

  const {
    data: brand,
    isLoading,
    isError,
  } = useQuery({
    queryKey: brandId ? QUERY_KEYS.brand(brandId) : ['brands', 'missing'],
    queryFn: () => brandApi.get(brandId as string),
    enabled: Boolean(brandId),
  });

  // Overview metrics — these share query keys (and cache) with the tabs below.
  const { data: restaurants = [] } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId ?? ''),
    queryFn: () => restaurantApi.listByBrand(brandId as string),
    enabled: Boolean(brandId),
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

  if (!brandId) return <Navigate to="/" replace />;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError || !brand) {
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <EmptyState
          title="Brand not found"
          description="This brand may have been removed, or you don't have access to it."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackLink />

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">{brand.name}</h1>
          <BrandStatusBadge status={brand.status} />
          {brand.menu_locked ? (
            <Badge variant="muted" className="gap-1">
              <Lock className="h-3 w-3" />
              Menu locked
            </Badge>
          ) : null}
          {!brand.is_active ? <Badge variant="danger">Inactive</Badge> : null}
        </div>
        {brand.status === 'rejected' && brand.reject_reason ? (
          <p className="text-sm text-red-600">Rejected: {brand.reject_reason}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          label="Restaurants"
          value={formatNumber(restaurants.length)}
          hint={restaurants.length === 1 ? 'outlet' : 'outlets'}
          icon={<Store className="h-5 w-5" />}
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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="restaurants">
          <RestaurantsTab brandId={brand.id} />
        </TabsContent>
        <TabsContent value="branches">
          <BranchesTab brandId={brand.id} />
        </TabsContent>
        <TabsContent value="staff">
          <StaffTab brandId={brand.id} />
        </TabsContent>
        <TabsContent value="menu">
          <MenuTab brand={brand} />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsTab brandId={brand.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/"
      className="inline-flex w-fit items-center gap-1 text-sm text-slate-500 transition-colors hover:text-slate-900"
    >
      <ArrowLeft className="h-4 w-4" />
      All brands
    </Link>
  );
}
