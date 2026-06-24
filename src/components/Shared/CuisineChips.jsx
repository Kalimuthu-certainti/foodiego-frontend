import { useState } from 'react';
import { useFilterStore } from '../../store/filterStore';

const CUISINES = [
  { id: '1',  name: 'Biryani',      emoji: '🍛', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=200&fit=crop&crop=center' },
  { id: '2',  name: 'Pizza',        emoji: '🍕', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop&crop=center' },
  { id: '3',  name: 'Burgers',      emoji: '🍔', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&crop=center' },
  { id: '4',  name: 'Chinese',      emoji: '🍜', imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&h=200&fit=crop&crop=center' },
  { id: '5',  name: 'South Indian', emoji: '🥘', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=200&fit=crop&crop=center' },
  { id: '6',  name: 'North Indian', emoji: '🫕', imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop&crop=center' },
  { id: '7',  name: 'Desserts',     emoji: '🍰', imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop&crop=center' },
  { id: '8',  name: 'Healthy',      emoji: '🥗', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop&crop=center' },
  { id: '9',  name: 'Rolls',        emoji: '🌯', imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=200&h=200&fit=crop&crop=center' },
  { id: '10', name: 'Sandwiches',   emoji: '🥪', imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop&crop=center' },
  { id: '11', name: 'Ice Cream',    emoji: '🍦', imageUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&h=200&fit=crop&crop=center' },
  { id: '12', name: 'Pasta',        emoji: '🍝', imageUrl: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=200&h=200&fit=crop&crop=center' },
];

function Chip({ c, active, onToggle }) {
  const [failed, setFailed] = useState(false);

  return (
    <button
      onClick={() => onToggle(c.name)}
      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      className="flex flex-col items-center gap-2.5 shrink-0 group"
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          overflow: 'hidden',
          border: active ? '3px solid #E85D04' : '3px solid #e1bfb2',
          boxShadow: active ? '0 0 0 4px rgba(232,93,4,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
          transform: active ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.2s ease',
          backgroundColor: '#f0eded',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        className="group-hover:scale-105"
      >
        {!failed ? (
          <img
            src={c.imageUrl}
            alt={c.name}
            onError={() => setFailed(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <span style={{ fontSize: 32 }}>{c.emoji}</span>
        )}
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: active ? '#E85D04' : '#594137',
          textAlign: 'center',
          width: 80,
          lineHeight: 1.3,
          display: 'block',
        }}
      >
        {c.name}
      </span>
    </button>
  );
}

export const CuisineChips = () => {
  const selectedCuisine = useFilterStore((s) => s.cuisine);
  const setCuisine = useFilterStore((s) => s.setCuisine);

  const toggle = (name) => setCuisine(selectedCuisine === name ? '' : name);

  return (
    <div
      style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' }}
    >
      {CUISINES.map((c) => (
        <Chip key={c.id} c={c} active={selectedCuisine === c.name} onToggle={toggle} />
      ))}
    </div>
  );
};
