import { create } from 'zustand';

export type NavigationTab = 'map' | 'sidebar';

interface NavigationState {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'map',
  setActiveTab: (activeTab) => set({ activeTab }),
}));
