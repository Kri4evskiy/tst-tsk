import type { MonitoringPoint } from './types';

export const INITIAL_MOCK_POINTS: MonitoringPoint[] = [
  {
    id: 'point-1',
    fieldId: 'field-1',
    coordinates: { lat: 50.415, lng: 30.495 },
    mgrs: '36U UA 22034 87773',
    type: 'SOIL_SAMPLE',
    description: 'Відбір проби ґрунту на глибині 0-30 см (азотний аналіз)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'point-2',
    fieldId: 'field-1',
    coordinates: { lat: 50.418, lng: 30.501 },
    mgrs: '36U UA 22472 88092',
    type: 'PESTS',
    description: 'Виявлено осередки клопа шкідливої черепашки',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'point-3',
    fieldId: 'field-2',
    coordinates: { lat: 50.417, lng: 30.522 },
    mgrs: '36U UA 23960 87931',
    type: 'PLANT_DISEASE',
    description: 'Ознаки білої гнилі на прикореневій шийці',
    createdAt: new Date().toISOString(),
  },
];
