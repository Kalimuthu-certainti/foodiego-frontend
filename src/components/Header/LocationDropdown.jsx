import { useState } from 'react';
import { useLocationSearch } from '../../hooks/useLocationSearch';
import { useLocationDetector } from '../../hooks/useLocationDetector';
import { useLocationStore } from '../../store/locationStore';
import { useDebounce } from '../../utils/debounce';

export const LocationDropdown = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data: results = [], isFetching } = useLocationSearch(debouncedQuery);
  const { isDetecting, detectLocation } = useLocationDetector();
  const setLocation = useLocationStore((s) => s.setLocation);

  const handleSelect = (result) => {
    setLocation(result.displayName, { lat: result.lat, lng: result.lng });
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl z-50 overflow-hidden border border-gray-100">
      <div className="p-3 border-b border-gray-100">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for area, street..."
          className="w-full text-sm bg-gray-100 rounded-full px-3 py-2 outline-none focus:ring-2 focus:ring-[#E85D04]/30"
        />
      </div>
      <button
        onClick={() => { detectLocation(); onClose(); }}
        disabled={isDetecting}
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#E85D04] hover:bg-[#FFF4EE] transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
        {isDetecting ? 'Detecting...' : 'Use current location'}
      </button>
      {debouncedQuery.length >= 2 && (
        <ul className="max-h-48 overflow-y-auto">
          {isFetching && (
            <li className="px-4 py-3 text-sm text-gray-400">Searching…</li>
          )}
          {!isFetching && results.length === 0 && (
            <li className="px-4 py-3 text-sm text-gray-400">No results found</li>
          )}
          {results.map((r, i) => (
            <li key={i}>
              <button
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition truncate"
              >
                📍 {r.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
