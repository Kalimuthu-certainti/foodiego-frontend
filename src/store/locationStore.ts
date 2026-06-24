import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Location } from '../types/location';

interface LocationStore {
  selected: Location | null;
  setLocation: (loc: Location) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      selected: null,
      setLocation: (loc) => set({ selected: loc }),
      clearLocation: () => set({ selected: null }),
    }),
    { name: 'onroute-location' },
  ),
);
