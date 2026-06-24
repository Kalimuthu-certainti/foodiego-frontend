import { useState } from 'react';
import { useFilterStore } from '../../store/filterStore';
import { FilterPanel } from './FilterPanel';

const QUICK_FILTERS = [
  { key: 'veg',    label: '🌿 Pure Veg' },
  { key: 'rating', label: '⭐ Ratings 4.0+' },
  { key: 'fast',   label: '⚡ Fast Delivery' },
  { key: 'offers', label: '🏷️ Offers' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating',    label: 'Rating' },
  { value: 'delivery',  label: 'Delivery Time' },
  { value: 'price_asc', label: 'Cost: Low to High' },
  { value: 'price_desc','label': 'Cost: High to Low' },
];

export const FilterSortBar = ({ totalCount }) => {
  const [open, setOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [activeQuick, setActiveQuick] = useState(null);
  const { filtersActive, clearFilters, vegOnly, toggleVegOnly, setRating, sortBy, setSort } = useFilterStore();

  const handleQuick = (key) => {
    if (activeQuick === key) {
      setActiveQuick(null);
      if (key === 'veg' && vegOnly) toggleVegOnly();
      if (key === 'rating') setRating(null);
    } else {
      setActiveQuick(key);
      if (key === 'veg' && !vegOnly) toggleVegOnly();
      if (key === 'rating') setRating('4.0+');
    }
  };

  const currentSort = SORT_OPTIONS.find((o) => o.value === sortBy) || SORT_OPTIONS[0];
  const anyActive = filtersActive || activeQuick;

  return (
    <div className="sticky top-[88px] z-40 bg-surface/90 border-b border-outline-variant" style={{ backdropFilter: 'blur(12px)' }}>
      <div className="max-w-[1280px] mx-auto px-[40px]">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide flex-1 min-w-0">
            {/* Sort button */}
            <div className="relative shrink-0">
              <button
                onClick={() => { setSortOpen((v) => !v); setOpen(false); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-label-md border transition-all ${
                  sortOpen
                    ? 'border-primary bg-primary text-white'
                    : 'border-outline-variant bg-white text-on-surface hover:border-primary hover:text-primary'
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
                </svg>
                Sort: {currentSort.label}
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-outline-variant rounded-xl shadow-lg py-1.5 z-50 min-w-[180px]">
                  {SORT_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => { setSort(o.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-label-md transition-colors hover:bg-surface-container ${
                        sortBy === o.value ? 'text-primary font-semibold' : 'text-on-surface'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-outline-variant shrink-0" />

            {/* Filter button */}
            <button
              onClick={() => { setOpen((v) => !v); setSortOpen(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-label-md border transition-all shrink-0 ${
                open || filtersActive
                  ? 'border-primary bg-primary text-white'
                  : 'border-outline-variant bg-white text-on-surface hover:border-primary hover:text-primary'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
              Filters
              {filtersActive && <span className="bg-white text-primary text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">!</span>}
            </button>

            {/* Quick filter pills */}
            {QUICK_FILTERS.map((f) => {
              const isActive = activeQuick === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => handleQuick(f.key)}
                  className={`shrink-0 px-4 py-2 rounded-full text-label-md border transition-all ${
                    isActive
                      ? 'border-primary bg-primary text-white'
                      : 'border-outline-variant bg-white text-on-surface hover:border-primary hover:text-primary'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}

            {anyActive && (
              <button
                onClick={() => { clearFilters(); setActiveQuick(null); }}
                className="shrink-0 text-label-md text-primary hover:underline ml-1 flex items-center gap-1"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                Clear all
              </button>
            )}
          </div>

          {/* Restaurant count */}
          {totalCount > 0 && (
            <span className="text-label-sm text-on-surface-variant ml-4 shrink-0">
              {totalCount} restaurants
            </span>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {open && (
        <div className="max-w-[1280px] mx-auto px-[40px] pb-4 border-t border-outline-variant">
          <FilterPanel onClose={() => setOpen(false)} />
        </div>
      )}

      {/* Sort dropdown backdrop */}
      {sortOpen && <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />}
    </div>
  );
};
