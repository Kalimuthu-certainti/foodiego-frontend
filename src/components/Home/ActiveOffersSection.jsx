import { useOffers } from '../../hooks/useOffers';
import { SectionHeader } from '../shared/SectionHeader';
import { HorizontalCardSkeleton } from '../shared/SkeletonLoader';
import { RestaurantCardHorizontal } from '../shared/RestaurantCard';

export const ActiveOffersSection = () => {
  const { data: restaurants = [], isLoading } = useOffers();

  if (isLoading) return (
    <section className="bg-brand-bg rounded-2xl p-6">
      <div className="animate-skeleton h-7 w-48 rounded-lg mb-5" />
      <HorizontalCardSkeleton />
    </section>
  );
  if (!restaurants.length) return null;

  return (
    <section className="bg-brand-bg rounded-2xl p-6">
      <SectionHeader
        title="Deals Near You"
        subtitle="Limited time offers — grab them before they're gone"
        action="View all"
      />
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {restaurants.map((r) => (
          <RestaurantCardHorizontal key={r.id} restaurant={r} />
        ))}
      </div>
    </section>
  );
};
