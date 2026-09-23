import type { FieldFeature } from '@/types';

/**
 * 4 реальних контури полів у Київській/Вінницькій області
 * Координати у стандарті GeoJSON: [longitude, latitude]
 */
export const MOCK_FIELDS: FieldFeature[] = [
  {
    type: 'Feature',
    properties: {
      id: 'field-1',
      name: 'Поле №1 - Озима пшениця',
      area: 68.4,
      crop: 'Озима пшениця',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [30.4850, 50.4100],
          [30.5050, 50.4110],
          [30.5080, 50.4220],
          [30.4870, 50.4210],
          [30.4850, 50.4100],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'field-2',
      name: 'Поле №2 - Соняшник класичний',
      area: 52.1,
      crop: 'Соняшник',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [30.5150, 50.4120],
          [30.5320, 50.4130],
          [30.5300, 50.4240],
          [30.5130, 50.4230],
          [30.5150, 50.4120],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'field-3',
      name: 'Поле №3 - Кукурудза на зерно',
      area: 84.7,
      crop: 'Кукурудза',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [30.4900, 50.4280],
          [30.5120, 50.4290],
          [30.5100, 50.4400],
          [30.4880, 50.4390],
          [30.4900, 50.4280],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'field-4',
      name: 'Поле №4 - Ріпак озимий',
      area: 41.3,
      crop: 'Ріпак',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [30.5200, 50.4300],
          [30.5380, 50.4310],
          [30.5360, 50.4410],
          [30.5180, 50.4400],
          [30.5200, 50.4300],
        ],
      ],
    },
  },
];
