export const formatRating = (rating: number) => rating.toFixed(1);

export const formatDeliveryTime = (min: number, max: number) => `${min}–${max} min`;

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(price);

export const formatReviewCount = (count: number) =>
  count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);
