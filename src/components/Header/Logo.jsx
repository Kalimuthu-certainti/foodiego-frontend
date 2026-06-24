import { useNavigate } from 'react-router-dom';

export const Logo = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate('/')} className="flex items-center gap-2 shrink-0 hover:opacity-90 transition-opacity">
      <span className="text-3xl leading-none">🔥</span>
      <span className="font-bold text-[22px] text-primary leading-none">FoodieGO</span>
    </button>
  );
};
