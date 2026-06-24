import { useEffect, useState } from 'react';
import { useLocationStore } from '../../store/locationStore';
import { useLocationDetector } from '../../hooks/useLocationDetector';
import { BannerCarousel } from '../shared/BannerCarousel';
import { CuisineChips } from '../shared/CuisineChips';
import { TopRatedSection } from './TopRatedSection';
import { ActiveOffersSection } from './ActiveOffersSection';
import { OrderAgainSection } from './OrderAgainSection';
import { FilterSortBar } from './FilterSortBar';
import { RestaurantList } from './RestaurantList';

const LocationOverlay = ({ onDetect, isDetecting }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center bg-surface">
    <div className="w-24 h-24 rounded-full bg-brand-bg flex items-center justify-center mb-6 shadow-lg">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="#E85D04">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
      </svg>
    </div>
    <h2 className="text-headline-lg text-on-surface tracking-tight">Where should we deliver?</h2>
    <p className="text-body-lg text-on-surface-variant mt-3 max-w-xs leading-relaxed">
      We need your location to show the best restaurants near you.
    </p>
    <button
      onClick={onDetect}
      disabled={isDetecting}
      className="mt-8 px-8 py-3.5 bg-primary text-white text-[15px] font-bold rounded-full hover:bg-primary-container transition-colors disabled:opacity-60 flex items-center gap-2 shadow-lg"
    >
      {isDetecting ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeDasharray="40 20" />
          </svg>
          Detecting location…
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
          </svg>
          Detect my location
        </>
      )}
    </button>
    <button
      onClick={() => useLocationStore.getState().setLocation('Bangalore, Karnataka', { lat: 12.9716, lng: 77.5946 })}
      className="mt-3 text-label-md text-on-surface-variant hover:text-primary underline transition-colors"
    >
      Use default location (Bangalore)
    </button>
  </div>
);

const DEFAULT_COORDS = { lat: 12.9716, lng: 77.5946 };

export const HomePage = () => {
  const coords = useLocationStore((s) => s.coords);
  const { isDetecting, detectLocation } = useLocationDetector();
  const [restaurantCount, setRestaurantCount] = useState(0);

  useEffect(() => {
    if (!coords) {
      // Auto-set Bangalore so page always renders; try geolocation in background
      useLocationStore.getState().setLocation('Bangalore, Karnataka', DEFAULT_COORDS);
      detectLocation();
    }
  }, []);

  if (!coords) return <LocationOverlay onDetect={detectLocation} isDetecting={isDetecting} />;

  return (
    <div className="min-h-screen bg-background">
      {/* Above-fold content */}
      <div className="max-w-[1280px] mx-auto px-10 pt-8 space-y-8">
        <BannerCarousel />
        <section>
          <h2 className="text-headline-sm text-on-surface mb-5">What are you craving?</h2>
          <CuisineChips />
        </section>
        <OrderAgainSection />
        <TopRatedSection />
        <ActiveOffersSection />
      </div>

      {/* Sticky filter bar — full width, then padded list */}
      <div className="mt-8">
        <div className="max-w-[1280px] mx-auto px-10 mb-4">
          <div className="border-t border-outline-variant" />
        </div>
        <FilterSortBar totalCount={restaurantCount} />
        <div className="max-w-[1280px] mx-auto px-10 py-8">
          <RestaurantList onCountChange={setRestaurantCount} />
        </div>
      </div>
    </div>
  );
};
