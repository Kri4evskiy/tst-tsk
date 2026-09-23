export type PointType = 'SOIL_SAMPLE' | 'PESTS' | 'PLANT_DISEASE' | 'OTHER';

export interface FieldProperties {
  id: string;
  name: string;
  area: number; // у гектарах
  crop: string;
}

export interface FieldFeature {
  type: 'Feature';
  properties: FieldProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][]; // GeoJSON: [longitude, latitude]
  };
}

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
