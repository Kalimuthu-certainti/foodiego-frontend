import { useRef, useEffect } from 'react';
import { useRestaurants } from '../../hooks/useRestaurants';
import { RestaurantCardGrid } from '../shared/RestaurantCard';
import { RestaurantGridSkeleton } from '../shared/SkeletonLoader';
import { EmptyState } from '../shared/EmptyState';
import { SectionHeader } from '../shared/SectionHeader';

export const RestaurantList = ({ onCountChange }) => {
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useRestaurants();
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const all    = data?.pages.flatMap((p) => p.restaurants) ?? [];
  const open   = all.filter((r) => r.isOpen !== false);
  const closed = all.filter((r) => r.isOpen === false);
  const sorted = [...open, ...closed];

  useEffect(() => {
    if (onCountChange) onCountChange(sorted.length);
  }, [sorted.length, onCountChange]);

  if (isLoading) return (
    <section>
      <div className="animate-skeleton h-7 w-52 rounded-lg mb-5" />
      <RestaurantGridSkeleton />
    </section>
  );

  if (!sorted.length) return (
    <EmptyState icon="🍽️" title="No restaurants found" message="Try adjusting your filters or search in a different area." />
  );

  return (
    <section>
      <SectionHeader
        title="All Restaurants"
        subtitle={`${sorted.length} restaurants near you`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sorted.map((r) => (
          <RestaurantCardGrid key={r.id} restaurant={r} />
        ))}
      </div>

      <div ref={sentinelRef} className="h-4 mt-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasNextPage && sorted.length > 3 && (
        <div className="text-center py-10 border-t border-outline-variant mt-6">
          <p className="text-body-md text-on-surface-variant font-medium">
            You've seen all restaurants in your area
          </p>
        </div>
      )}
    </section>
  );
};
