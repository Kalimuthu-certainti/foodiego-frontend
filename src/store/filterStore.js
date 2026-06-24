import { create } from 'zustand';

const defaults = { cuisine: null, rating: null, price: null, vegOnly: false, sortBy: 'relevance' };

const isActive = (s) =>
  s.cuisine !== null || s.rating !== null || s.price !== null || s.vegOnly || s.sortBy !== 'relevance';

export const useFilterStore = create((set, get) => ({
  ...defaults,
  filtersActive: false,

  setCuisine: (cuisine) => set((s) => { const n = { ...s, cuisine }; return { ...n, filtersActive: isActive(n) }; }),
  setRating:  (rating)  => set((s) => { const n = { ...s, rating };  return { ...n, filtersActive: isActive(n) }; }),
  setPrice:   (price)   => set((s) => { const n = { ...s, price };   return { ...n, filtersActive: isActive(n) }; }),
  toggleVegOnly: ()     => set((s) => { const n = { ...s, vegOnly: !s.vegOnly }; return { ...n, filtersActive: isActive(n) }; }),
  setSort:    (sortBy)  => set((s) => { const n = { ...s, sortBy };  return { ...n, filtersActive: isActive(n) }; }),

  clearFilters: () => set({ ...defaults, filtersActive: false }),

  getActiveFilters: () => {
    const { cuisine, rating, price, vegOnly, sortBy } = get();
    const f = {};
    if (cuisine) f.cuisine = cuisine;
    if (rating)  f.rating  = rating;
    if (price)   f.price   = price;
    if (vegOnly) f.vegOnly = true;
    if (sortBy && sortBy !== 'relevance') f.sortBy = sortBy;
    return f;
  },
}));
