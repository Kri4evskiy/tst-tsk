import type { Feature, Polygon } from 'geojson';

export interface FieldProperties {
  id: string;
  name: string;
  area: number; // у гектарах
  crop: string;
}

export type FieldFeature = Feature<Polygon, FieldProperties>;
