import { useCuisines } from '../../hooks/useCuisines';
import { useFilterStore } from '../../store/filterStore';
import { CuisineChipsSkeleton } from '../shared/SkeletonLoader';

const EMOJI_MAP = {
  biryani: '🍛', pizza: '🍕', burgers: '🍔', chinese: '🍜',
  'south indian': '🥘', 'north indian': '🫕', desserts: '🍰', healthy: '🥗',
};

export const CuisineChips = () => {
  const { data: cuisines = [], isLoading } = useCuisines();
  const { cuisine: active, setCuisine } = useFilterStore();

  if (isLoading) return <CuisineChipsSkeleton />;
  if (!cuisines.length) return null;

  const toggle = (name) => setCuisine(active === name ? null : name);

  return (
    <div>
      <h2 className="text-[22px] font-bold text-[#282C3F] mb-4">What's on your mind?</h2>
      <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
        {cuisines.map((c) => {
          const emoji = EMOJI_MAP[c.name.toLowerCase()] || '🍽️';
          const isActive = active === c.name;
          return (
            <button
              key={c.id || c.name}
              onClick={() => toggle(c.name)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-[50px] h-[50px] md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl border-2 transition-all duration-200 ${
                  isActive
                    ? 'border-[#E85D04] bg-[#FFF0E6]'
                    : 'border-[#E9E9EB] bg-white group-hover:border-[#E85D04] group-hover:bg-[#FFF0E6]'
                }`}
              >
                {emoji}
              </div>
              <span
                className={`text-[11px] md:text-xs font-medium text-center leading-tight w-16 truncate ${
                  isActive ? 'text-[#E85D04]' : 'text-[#282C3F] group-hover:text-[#E85D04]'
                }`}
              >
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
