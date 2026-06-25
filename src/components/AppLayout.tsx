import { NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  LogOut,
  MapPin,
  UtensilsCrossed,
  Users,
  ChefHat,
  Menu,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBrandScope } from '../hooks/useBrandScope';
import { useQuery } from '@tanstack/react-query';
import * as brandApi from '../services/brandApi';
import { QUERY_KEYS, APP_NAME } from '../utils/constants';
import { cn } from '../utils/cn';

const NAV = [
  { to: '/branches', label: 'Branches', icon: MapPin },
  { to: '/staff',    label: 'Staff',    icon: Users },
  { to: '/menu',     label: 'Menu',     icon: ChefHat },
  { to: '/reports',  label: 'Reports',  icon: BarChart3 },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { brandId } = useBrandScope();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: brand } = useQuery({
    queryKey: brandId ? QUERY_KEYS.brand(brandId) : ['brand', 'none'],
    queryFn: () => brandApi.get(brandId as string),
    enabled: Boolean(brandId),
  });

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-100 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
          <UtensilsCrossed className="h-4 w-4" />
        </span>
        <span className="font-semibold tracking-tight text-slate-900">{APP_NAME}</span>
      </div>

      {/* Brand chip */}
      {brand && (
        <div className="mx-3 mt-4 rounded-lg bg-brand-50 px-3 py-2.5 ring-1 ring-inset ring-brand-100">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-500">Brand</p>
          <p className="mt-0.5 truncate text-sm font-medium text-brand-900">{brand.name}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="mt-4 flex-1 space-y-0.5 px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User / logout */}
      <div className="shrink-0 border-t border-slate-100 p-3">
        {user?.email && (
          <div className="mb-1.5 flex items-center gap-2.5 rounded-lg px-3 py-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold uppercase text-brand-700">
              {user.email.slice(0, 1)}
            </span>
            <span className="min-w-0 truncate text-xs text-slate-600">{user.email}</span>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-500 transition-all duration-150 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 border-r border-slate-200 bg-white">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-slate-900">{APP_NAME}</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
