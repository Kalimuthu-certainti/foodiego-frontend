import { useState, useRef, useEffect } from 'react';

export default function RestaurantDropdown({ restaurants, value, onChange, placeholder = 'Select a restaurant…' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = restaurants.find((r) => r.restaurant_id === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-5 py-4 bg-white border-2 rounded-2xl text-left transition-all ${
          open ? 'border-orange-400 shadow-md' : 'border-gray-100 hover:border-gray-200'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="min-w-0">
            {selected ? (
              <>
                <p className="text-sm font-bold text-gray-900 truncate">{selected.name}</p>
                {selected.cuisine_type && (
                  <p className="text-xs text-gray-400">{selected.cuisine_type}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">{placeholder}</p>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
          {restaurants.map((r) => (
            <button
              key={r.restaurant_id}
              type="button"
              onClick={() => { onChange(r.restaurant_id); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-orange-50 transition-colors ${
                r.restaurant_id === value ? 'bg-orange-50' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                r.restaurant_id === value ? 'bg-orange-500' : 'bg-orange-100'
              }`}>
                <svg className={`w-4 h-4 ${r.restaurant_id === value ? 'text-white' : 'text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold truncate ${r.restaurant_id === value ? 'text-orange-600' : 'text-gray-800'}`}>
                  {r.name}
                </p>
                {r.cuisine_type && <p className="text-xs text-gray-400">{r.cuisine_type}</p>}
              </div>
              {r.restaurant_id === value && (
                <svg className="w-4 h-4 text-orange-500 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
