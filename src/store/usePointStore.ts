import { create } from 'zustand';
import type { MonitoringPoint, PointType, SortOrder } from '@/types';

const STORAGE_KEY = 'agtech_monitoring_points_v1';

const INITIAL_MOCK_POINTS: MonitoringPoint[] = [
  {
    id: 'point-1',
    fieldId: 'field-1',
    coordinates: { lat: 50.4150, lng: 30.4950 },
    mgrs: '36U UB 06742 88412',
    type: 'SOIL_SAMPLE',
    description: 'Відбір проби ґрунту на глибині 0-30 см (азотний аналіз)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'point-2',
    fieldId: 'field-1',
    coordinates: { lat: 50.4180, lng: 30.5010 },
    mgrs: '36U UB 07168 88746',
    type: 'PESTS',
    description: 'Виявлено осередки клопа шкідливої черепашки',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'point-3',
    fieldId: 'field-2',
    coordinates: { lat: 50.4170, lng: 30.5220 },
    mgrs: '36U UB 08660 88636',
    type: 'PLANT_DISEASE',
    description: 'Ознаки білої гнилі на прикореневій шийці',
    createdAt: new Date().toISOString(),
  },
];

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
  
  // Actions
  addPoint: (point: MonitoringPoint) => void;
  deletePoint: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedType: (type: PointType | 'ALL') => void;
  setSortOrder: (order: SortOrder) => void;

  // Selected point for quick map focus
  focusedPoint: MonitoringPoint | null;
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

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedType: (selectedType) => set({ selectedType }),
  setSortOrder: (sortOrder) => set({ sortOrder }),
  setFocusedPoint: (focusedPoint) => set({ focusedPoint }),
}));
