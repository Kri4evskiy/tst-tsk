import type { MonitoringPoint } from '@/entities/point';
import type { FieldFeature } from '@/entities/field';
import { POINT_TYPE_CONFIGS } from '@/shared/config/pointTypes';

/**
 * Завантажує текстовий файл у браузері
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Експорт списку моніторингових точок у формат GeoJSON FeatureCollection
 */
export function exportToGeoJSON(points: MonitoringPoint[], fields: FieldFeature[]) {
  const featureCollection = {
    type: 'FeatureCollection',
    features: points.map((p) => {
      const field = fields.find((f) => f.properties.id === p.fieldId);
      const typeLabel = POINT_TYPE_CONFIGS[p.type]?.label || p.type;
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [p.coordinates.lng, p.coordinates.lat], // RFC 7946
        },
        properties: {
          id: p.id,
          fieldId: p.fieldId,
          fieldName: field?.properties.name || '',
          type: p.type,
          typeLabel,
          mgrs: p.mgrs,
          description: p.description || '',
          createdAt: p.createdAt,
        },
      };
    }),
  };

  const jsonString = JSON.stringify(featureCollection, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(jsonString, `monitoring-points-${dateStr}.geojson`, 'application/geo+json');
}

/**
 * Експорт списку точок у CSV (з UTF-8 BOM для коректного відкриття в Excel)
 */
export function exportToCSV(points: MonitoringPoint[], fields: FieldFeature[]) {
  const headers = ['ID', 'Поле', 'Тип', 'Широта (Lat)', 'Довгота (Lng)', 'MGRS', 'Опис', 'Дата створення'];

  const rows = points.map((p) => {
    const field = fields.find((f) => f.properties.id === p.fieldId);
    const typeLabel = POINT_TYPE_CONFIGS[p.type]?.label || p.type;
    return [
      `"${p.id}"`,
      `"${(field?.properties.name || '').replace(/"/g, '""')}"`,
      `"${typeLabel}"`,
      p.coordinates.lat,
      p.coordinates.lng,
      `"${p.mgrs}"`,
      `"${(p.description || '').replace(/"/g, '""')}"`,
      `"${p.createdAt}"`,
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadFile(csvContent, `monitoring-points-${dateStr}.csv`, 'text/csv;charset=utf-8;');
}
