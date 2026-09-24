import { create } from 'zustand';
import type { MonitoringPoint, SortOrder } from './types';
import type { PointType } from '@/shared/config/pointTypes';
import { INITIAL_MOCK_POINTS } from './mockPoints';

const STORAGE_KEY = 'agtech_monitoring_points_v1';

function loadPoints(): MonitoringPoint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_MOCK_POINTS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_MOCK_POINTS;
  }
}

function savePoints(points: MonitoringPoint[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
  } catch (e) {
    console.error('Не вдалося зберегти точки в localStorage:', e);
  }
}

interface PointStore {
  points: MonitoringPoint[];
  searchQuery: string;
  selectedType: PointType | 'ALL';
  sortOrder: SortOrder;
  focusedPoint: MonitoringPoint | null;

  // Actions
  addPoint: (point: MonitoringPoint) => void;
  deletePoint: (id: string) => void;
  resetPoints: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedType: (type: PointType | 'ALL') => void;
  setSortOrder: (order: SortOrder) => void;
  setFocusedPoint: (point: MonitoringPoint | null) => void;
}

export const usePointStore = create<PointStore>((set) => ({
  points: loadPoints(),
  searchQuery: '',
  selectedType: 'ALL',
  sortOrder: 'desc',
  focusedPoint: null,

  addPoint: (newPoint) =>
    set((state) => {
      const updated = [newPoint, ...state.points];
      savePoints(updated);
      return { points: updated };
    }),

  deletePoint: (id) =>
    set((state) => {
      const updated = state.points.filter((p) => p.id !== id);
      savePoints(updated);
      return {
        points: updated,
        focusedPoint: state.focusedPoint?.id === id ? null : state.focusedPoint,
      };
    }),

  resetPoints: () =>
    set(() => {
      savePoints(INITIAL_MOCK_POINTS);
      return {
        points: INITIAL_MOCK_POINTS,
        focusedPoint: null,
      };
    }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedType: (selectedType) => set({ selectedType }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setFocusedPoint: (focusedPoint) => set({ focusedPoint }),
}));
