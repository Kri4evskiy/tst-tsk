import { create } from 'zustand';
import type { BasemapType } from '@/shared/config/basemaps';

interface BasemapStore {
  activeBasemap: BasemapType;
  setBasemap: (basemap: BasemapType) => void;
}

export const useBasemapStore = create<BasemapStore>((set) => ({
  activeBasemap: 'streets',
  setBasemap: (activeBasemap) => set({ activeBasemap }),
}));
