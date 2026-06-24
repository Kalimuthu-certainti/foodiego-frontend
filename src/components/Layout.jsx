import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './header/Header';
import { useCartStore } from '../store/cartStore';

const NAV_ITEMS = [
  {
    key: 'home',
    label: 'Home',
    path: '/',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#E85D04' : 'none'} stroke={active ? '#E85D04' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    key: 'search',
    label: 'Search',
    path: '/search',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#E85D04' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
  },
  {
    key: 'cart',
    label: 'Cart',
    path: '/cart',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#E85D04' : 'none'} stroke={active ? '#E85D04' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
  },
  {
    key: 'orders',
    label: 'Orders',
    path: '/orders',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#E85D04' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#E85D04' : 'none'} stroke={active ? '#E85D04' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

const MobileNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const cartCount = useCartStore((s) => s.count);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white border-t border-outline-variant safe-area-pb">
      <div className="flex justify-around items-center h-16 px-2">
        {NAV_ITEMS.map(({ key, label, path, icon }) => {
          const active = pathname === path;
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 group"
            >
              <div className="relative">
                {icon(active)}
                {key === 'cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const Layout = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="mt-[88px] pb-16 md:pb-0">
      <Outlet />
    </main>
    <MobileNav />
  </div>
);
