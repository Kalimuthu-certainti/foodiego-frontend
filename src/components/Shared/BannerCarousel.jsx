import { useState, useEffect, useCallback } from 'react';
import { useBanners } from '../../hooks/useBanners';
import { SkeletonBanner } from './SkeletonLoader';

export const BannerCarousel = () => {
  const { data: banners = [], isLoading } = useBanners();
  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive((a) => (a + 1) % banners.length), [banners.length]);
  const prev = () => setActive((a) => (a - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next, banners.length]);

  if (isLoading) return <SkeletonBanner />;
  if (!banners.length) return null;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden select-none" style={{ aspectRatio: '16/5' }}>
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {banners.map((b, i) => (
          <div key={b.id || i} className="relative flex-shrink-0 w-full h-full">
            <img
              src={b.imageUrl || `https://placehold.co/1280x400/E85D04/ffffff?text=${encodeURIComponent(b.title || 'Offer')}`}
              alt={b.title || ''}
              className="w-full h-full object-cover"
            />
            {/* Gradient left→right so text is readable */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }} />
            {/* Text */}
            <div className="absolute bottom-8 left-8 text-white max-w-xs">
              {b.subtitle && (
                <span className="text-[11px] font-bold tracking-[0.15em] uppercase bg-primary px-2 py-0.5 rounded mb-2 inline-block">
                  LIMITED TIME
                </span>
              )}
              {b.title && <h2 className="font-bold text-[22px] leading-[28px] mt-1">{b.title}</h2>}
              {b.subtitle && <p className="text-[13px] mt-1 text-white/80">{b.subtitle}</p>}
              {b.ctaText && (
                <button className="mt-4 bg-white text-primary font-bold text-[13px] px-5 py-2 rounded-full hover:bg-primary hover:text-white transition-colors flex items-center gap-2">
                  {b.ctaText}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Arrows — only when >1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-outline-variant rounded-full w-10 h-10 flex items-center justify-center shadow transition-all z-10"
            aria-label="Previous"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border border-outline-variant rounded-full w-10 h-10 flex items-center justify-center shadow transition-all z-10"
            aria-label="Next"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${i === active ? 'bg-white w-6 h-2' : 'bg-white/50 w-2 h-2'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
