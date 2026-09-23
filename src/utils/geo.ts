import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import { forward } from 'mgrs';
import type { FieldFeature } from '@/types';

/**
 * Важливе нагадування:
 * - Leaflet використовує: [latitude, longitude]
 * - GeoJSON, Turf.js та MGRS очікують: [longitude, latitude]
 */

/**
 * Перевіряє, чи знаходиться клікнута точка [lat, lng] всередині контуру GeoJSON полігону.
 */
export function isPointInField(lat: number, lng: number, field: FieldFeature): boolean {
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
 * Конвертує координати WGS 84 (lat, lng) у стандартизовану MGRS сітку на клієнті.
 * Повертає відформатований рядок із пробілами (наприклад: "36U VB 12345 67890").
 */
export function convertWgs84ToMgrs(lat: number, lng: number, precision: number = 5): string {
  try {
    // forward очікує [longitude, latitude]
    const rawMgrs = forward([lng, lat], precision);
    
    // Форматування: 2-3 цифри зони + 1 літера широтного поясу + 2 літери квадрата + координати
    // Приклад вихідного рядка: 36UUB1234567890 -> "36U UB 12345 67890"
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

/**
 * Форматування дати відповідно до вимог української локалізації (без сторонніх важких бібліотек)
 */
export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}
