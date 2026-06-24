import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';

export const CartIcon = () => {
  const count = useCartStore((s) => s.count);
  const navigate = useNavigate();
  const display = count > 9 ? '9+' : count;

  return (
    <button
      onClick={() => navigate('/cart')}
      className="relative cursor-pointer group"
      aria-label="Cart"
    >
      <svg className="text-on-surface-variant group-hover:text-primary transition-colors" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center">
          {display}
        </span>
      )}
    </button>
  );
};
