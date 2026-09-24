export type BasemapType = 'streets' | 'satellite';

export interface BasemapConfig {
  id: BasemapType;
  name: string;
  url: string;
  attribution: string;
  maxZoom: number;
}

export const BASEMAPS: Record<BasemapType, BasemapConfig> = {
  streets: {
    id: 'streets',
    name: 'Схема (Voyager)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  satellite: {
    id: 'satellite',
    name: 'Супутник (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and GIS User Community',
    maxZoom: 18,
  },
};
