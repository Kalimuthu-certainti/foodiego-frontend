import { useState, useEffect, useRef } from 'react';
import { useBanners } from '../../hooks/useBanners';
import { BannerSkeleton } from '../shared/SkeletonLoader';
import { BANNER_INTERVAL } from '../../lib/constants';

export const BannerCarousel = () => {
  const { data: banners = [], isLoading } = useBanners();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (banners.length <= 1 || paused) return;
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, BANNER_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [banners.length, paused]);

  if (isLoading) return <BannerSkeleton />;
  if (!banners.length) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl h-[200px] md:h-[250px] cursor-pointer select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b, i) => (
          <div key={i} className="flex-shrink-0 w-full h-full relative">
            <img
              src={b.imageUrl}
              alt={b.title || `Banner ${i + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = `https://placehold.co/1200x250/E85D04/white?text=${encodeURIComponent(b.title || 'Offer')}`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {b.title && (
              <div className="absolute bottom-4 left-5 right-16">
                <p className="text-white font-bold text-base md:text-lg drop-shadow leading-tight line-clamp-2">
                  {b.title}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-md transition-all border border-[#E9E9EB]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white hover:bg-gray-50 rounded-full flex items-center justify-center shadow-md transition-all border border-[#E9E9EB]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
