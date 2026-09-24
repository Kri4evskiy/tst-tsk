import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import { forward } from 'mgrs';
import type { Feature, Polygon } from 'geojson';

/**
 * Важливе розмежування осей координат:
 * - Leaflet: [latitude, longitude]
 * - GeoJSON (RFC 7946), Turf.js та MGRS: [longitude, latitude]
 */

/**
 * Перевіряє, чи знаходиться клікнута точка [lat, lng] всередині контуру GeoJSON полігону.
 */
export function isPointInField(
  lat: number,
  lng: number,
  field: Feature<Polygon, any>
): boolean {
  try {
    const pt = point([lng, lat]);
    const poly = polygon(field.geometry.coordinates);
    return booleanPointInPolygon(pt, poly);
  } catch (error) {
    console.error('Помилка перевірки Point-in-Polygon:', error);
    return false;
  }
}

/**
 * Конвертує координати WGS 84 (lat, lng) у стандартизовану військову MGRS сітку на клієнті.
 * Повертає відформатований рядок із пробілами (наприклад: "36U UA 22034 87773").
 */
export function convertWgs84ToMgrs(lat: number, lng: number, precision: number = 5): string {
  try {
    // forward очікує [longitude, latitude]
    const rawMgrs = forward([lng, lat], precision);

    // Форматування: зона (2-3 символи) + квадрат (2 літери) + координати
    const match = rawMgrs.match(/^(\d{1,2}[A-Z])([A-Z]{2})(\d+)$/);
    if (!match || !match[1] || !match[2] || !match[3]) {
      return rawMgrs;
    }

    const [, zone, square, eastingNorthing] = match;
    const half = Math.floor(eastingNorthing.length / 2);
    const easting = eastingNorthing.substring(0, half);
    const northing = eastingNorthing.substring(half);

    return `${zone} ${square} ${easting} ${northing}`;
  } catch (error) {
    console.error('Помилка обчислення MGRS координат:', error);
    return 'Некоректні координати';
  }
}
