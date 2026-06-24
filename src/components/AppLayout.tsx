import { Link, Outlet } from 'react-router-dom';
import { LogOut, UtensilsCrossed } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { APP_NAME } from '../utils/constants';

/** App shell: header with the app name + logout, renders the routed page via <Outlet/>. */
export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition-transform group-hover:-rotate-6">
              <UtensilsCrossed className="h-[18px] w-[18px]" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight text-slate-900">
              {APP_NAME}
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {user?.email ? (
              <span className="hidden items-center gap-2 rounded-full bg-slate-100 py-1 pl-1 pr-3 text-sm text-slate-600 sm:inline-flex">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold uppercase text-brand-700">
                  {user.email.slice(0, 1)}
                </span>
                {user.email}
              </span>
            ) : null}
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
