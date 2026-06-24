import { useTopRated } from '../../hooks/useTopRated';
import { SectionHeader } from '../shared/SectionHeader';
import { HorizontalCardSkeleton } from '../shared/SkeletonLoader';
import { RestaurantCardHorizontal } from '../shared/RestaurantCard';

export const TopRatedSection = () => {
  const { data: restaurants = [], isLoading } = useTopRated();

  if (isLoading) return (
    <section>
      <div className="animate-skeleton h-7 w-48 rounded-lg mb-5" />
      <HorizontalCardSkeleton />
    </section>
  );
  if (!restaurants.length) return null;

  return (
    <section>
      <SectionHeader
        title="Top Picks Near You"
        subtitle={`${restaurants.length} highly rated spots · Loved by thousands`}
        action="See all"
      />
      <div
        className="flex gap-4 pb-3"
        style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
      >
        {restaurants.map((r) => (
          <RestaurantCardHorizontal key={r.id} restaurant={r} />
        ))}
      </div>
    </section>
  );
};
