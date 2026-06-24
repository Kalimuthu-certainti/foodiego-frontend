import { useState } from 'react';
import { useFilterStore } from '../../store/filterStore';

const RATINGS = ['4.5+', '4.0+', '3.5+'];
const PRICES  = ['₹', '₹₹', '₹₹₹'];
const SORTS   = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating',    label: 'Top Rated' },
  { value: 'cost_asc',  label: 'Price: Low to High' },
  { value: 'cost_desc', label: 'Price: High to Low' },
];

const Chip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
      active
        ? 'border-[#E85D04] bg-[#E85D04] text-white'
        : 'border-[#E9E9EB] bg-white text-[#282C3F] hover:border-[#E85D04] hover:text-[#E85D04]'
    }`}
  >
    {label}
  </button>
);

export const FilterPanel = ({ onClose }) => {
  const store = useFilterStore();
  const [localRating, setLocalRating] = useState(store.rating);
  const [localPrice,  setLocalPrice]  = useState(store.price);
  const [localVeg,    setLocalVeg]    = useState(store.vegOnly);
  const [localSort,   setLocalSort]   = useState(store.sortBy);

  const apply = () => {
    store.setRating(localRating);
    store.setPrice(localPrice);
    if (localVeg !== store.vegOnly) store.toggleVegOnly();
    store.setSort(localSort);
    onClose?.();
  };

  const reset = () => {
    setLocalRating(null);
    setLocalPrice(null);
    setLocalVeg(false);
    setLocalSort('relevance');
  };

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-[#E9E9EB] p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#282C3F] text-base">Filters</h3>
        <button onClick={reset} className="text-sm font-semibold text-[#E85D04] hover:underline">
          Clear all
        </button>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#686B78] uppercase tracking-wider mb-2.5">Rating</p>
        <div className="flex gap-2 flex-wrap">
          {RATINGS.map(r => (
            <Chip key={r} label={r} active={localRating === r} onClick={() => setLocalRating(localRating === r ? null : r)} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#686B78] uppercase tracking-wider mb-2.5">Price Range</p>
        <div className="flex gap-2 flex-wrap">
          {PRICES.map(p => (
            <Chip key={p} label={p} active={localPrice === p} onClick={() => setLocalPrice(localPrice === p ? null : p)} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[#686B78] uppercase tracking-wider mb-2.5">Sort By</p>
        <div className="flex gap-2 flex-wrap">
          {SORTS.map(s => (
            <Chip key={s.value} label={s.label} active={localSort === s.value} onClick={() => setLocalSort(s.value)} />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#E9E9EB]">
        <label className="flex items-center gap-2.5 cursor-pointer" onClick={() => setLocalVeg(v => !v)}>
          <div className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${localVeg ? 'bg-green-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${localVeg ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm font-semibold text-[#282C3F]">Pure Veg</span>
        </label>
        <button
          onClick={apply}
          className="px-6 py-2 bg-[#E85D04] text-white text-sm font-semibold rounded-lg hover:bg-[#d45200] transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
};
