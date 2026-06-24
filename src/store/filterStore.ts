import { create } from 'zustand';
import type { Filters, SortOption } from '../types/filters';

interface FilterStore extends Filters {
  setCuisine: (id: number | null) => void;
  setSearch: (q: string) => void;
  setSort: (sort: SortOption) => void;
  setHasOffers: (v: boolean) => void;
  reset: () => void;
}

const defaults: Filters = {
  cuisine_id: null,
  search: '',
  sort: '',
  has_offers: false,
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...defaults,
  setCuisine: (id) => set({ cuisine_id: id }),
  setSearch: (q) => set({ search: q }),
  setSort: (sort) => set({ sort }),
  setHasOffers: (v) => set({ has_offers: v }),
  reset: () => set(defaults),
}));
