import type { PointType } from '@/shared/config/pointTypes';

export interface MonitoringPoint {
  id: string;
  fieldId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mgrs: string;
  type: PointType;
  description?: string;
  createdAt: string; // ISO рядок
}

export type SortOrder = 'desc' | 'asc';
