import { useOrderAgain } from '../../hooks/useOrderAgain';
import { useAuthStore } from '../../store/authStore';
import { SectionHeader } from '../shared/SectionHeader';
import { RestaurantCardCompact } from '../shared/RestaurantCard';

export const OrderAgainSection = () => {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { data: restaurants = [], isLoading } = useOrderAgain();

  if (!isLoggedIn || isLoading || !restaurants.length) return null;

  return (
    <section>
      <SectionHeader title="Order Again" subtitle="Your recent favourites" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {restaurants.map((r) => (
          <RestaurantCardCompact key={r.id} restaurant={r} onReorder={() => {}} />
        ))}
      </div>
    </section>
  );
};
