import type { Feature, Polygon } from 'geojson';

export type PointType = 'SOIL_SAMPLE' | 'PESTS' | 'PLANT_DISEASE' | 'OTHER';

export interface FieldProperties {
  id: string;
  name: string;
  area: number; // у гектарах
  crop: string;
}

export type FieldFeature = Feature<Polygon, FieldProperties>;

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
