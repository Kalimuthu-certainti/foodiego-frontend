import { useAuthStore } from '../../store/authStore';

export const ProfileIcon = () => {
  const { isLoggedIn, diner, clearAuth } = useAuthStore();

  if (!isLoggedIn) {
    return (
      <button
        className="px-4 py-2 border border-primary text-primary text-[13px] font-semibold rounded-lg hover:bg-brand-bg transition-colors whitespace-nowrap"
      >
        Sign in
      </button>
    );
  }

  const initials = (diner?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <button
      onClick={clearAuth}
      className="flex items-center gap-2 cursor-pointer p-1 hover:bg-surface-container rounded-full transition-colors group"
      title="Sign out"
    >
      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
        {initials}
      </div>
    </button>
  );
};
