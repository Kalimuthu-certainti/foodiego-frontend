import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
};

export const HeaderSearchBar = () => {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const diner = useAuthStore((s) => s.diner);
  const name = diner?.name?.split(' ')[0] || null;

  return (
    <div className="flex flex-col flex-1 max-w-[480px]">
      {isLoggedIn && name && (
        <p className="text-[11px] text-on-surface-variant mb-1 ml-4">
          {getGreeting()}, {name} 👋
        </p>
      )}
      <button
        onClick={() => navigate('/search')}
        className="relative w-full h-[48px] flex items-center"
      >
        <input
          readOnly
          type="text"
          placeholder="Search for restaurants, cuisines, dishes..."
          onClick={() => navigate('/search')}
          className="w-full h-full bg-surface-container rounded-full pl-11 pr-5 border-none text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        />
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
      </button>
    </div>
  );
};
