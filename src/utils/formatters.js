export const formatPrice = (p) => `₹${p}`;
export const formatRating = (r) => r?.toFixed(1) ?? '—';
export const formatDeliveryTime = (m) => (!m || m === 'Coming Soon' ? 'Coming Soon' : `${m} min`);
export const formatCuisines = (arr) => arr?.slice(0, 2).join(', ') ?? '';
export const truncate = (str, n) => (str?.length > n ? str.slice(0, n) + '...' : str);
