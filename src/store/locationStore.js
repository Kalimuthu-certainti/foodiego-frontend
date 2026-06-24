import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLocationStore = create(
  persist(
    (set) => ({
      areaName: null,
      coords: null,
      isDetecting: false,
      setLocation: (areaName, coords) => set({ areaName, coords }),
      setAreaName: (areaName) => set({ areaName }),
      setCoords: (coords) => set({ coords }),
      clearLocation: () => set({ areaName: null, coords: null }),
      setDetecting: (isDetecting) => set({ isDetecting }),
    }),
    { name: 'foodiego-location' },
  ),
);
