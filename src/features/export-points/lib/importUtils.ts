import type { MonitoringPoint } from '@/entities/point';
import type { FieldFeature } from '@/entities/field';
import { POINT_TYPE_CONFIGS, type PointType } from '@/shared/config/pointTypes';
import { isPointInField, convertWgs84ToMgrs } from '@/shared/lib/geo/geo';

export interface ParseResult {
  success: boolean;
  points: MonitoringPoint[];
  error?: string;
}

/**
 * Нормалізує тип точки моніторингу за ключем або українською міткою
 */
function resolvePointType(rawType: string): PointType {
  const normalized = rawType.trim().toUpperCase();

  if (normalized in POINT_TYPE_CONFIGS) {
    return normalized as PointType;
  }

  // Співставлення за українськими назвами
  const lower = rawType.trim().toLowerCase();
  if (lower.includes('ґрунт') || lower.includes('грунт') || lower.includes('проба')) {
    return 'SOIL_SAMPLE';
  }
  if (lower.includes('шкідник') || lower.includes('пест')) {
    return 'PESTS';
  }
  if (lower.includes('хвороб') || lower.includes('болезн') || lower.includes('disease')) {
    return 'PLANT_DISEASE';
  }

  return 'OTHER';
}

/**
 * Розбиває рядок CSV на поля з коректною обробкою лапок
 */
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Парсить текстовий вміст GeoJSON або CSV файлу
 */
export function parseImportFileContent(
  content: string,
  filename: string,
  fields: FieldFeature[]
): ParseResult {
  const isJson = filename.endsWith('.geojson') || filename.endsWith('.json') || content.trim().startsWith('{');

  if (isJson) {
    try {
      const parsed = JSON.parse(content);
      if (!parsed || parsed.type !== 'FeatureCollection' || !Array.isArray(parsed.features)) {
        return {
          success: false,
          points: [],
          error: 'Некоректний формат GeoJSON: очікується FeatureCollection з масивом features.',
        };
      }

      const points: MonitoringPoint[] = [];

      parsed.features.forEach((feat: unknown, idx: number) => {
        if (!feat || typeof feat !== 'object') return;
        const feature = feat as {
          type?: string;
          geometry?: { type?: string; coordinates?: number[] };
          properties?: Record<string, unknown>;
        };

        if (
          feature.geometry?.type !== 'Point' ||
          !Array.isArray(feature.geometry.coordinates) ||
          feature.geometry.coordinates.length < 2
        ) {
          return;
        }

        const [lng, lat] = feature.geometry.coordinates;
        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
          return;
        }

        const props = feature.properties || {};

        // Шукаємо прив'язку до поля
        let fieldId = typeof props.fieldId === 'string' ? props.fieldId : '';
        const matchingField =
          fields.find((f) => f.properties.id === fieldId) ||
          fields.find((f) => isPointInField(lat, lng, f));

        if (matchingField) {
          fieldId = matchingField.properties.id;
        } else if (fields[0]) {
          fieldId = fields[0].properties.id;
        }

        const rawType = typeof props.type === 'string' ? props.type : (typeof props.typeLabel === 'string' ? props.typeLabel : 'OTHER');
        const type = resolvePointType(rawType);
        const mgrs = typeof props.mgrs === 'string' && props.mgrs.trim() ? props.mgrs.trim() : convertWgs84ToMgrs(lat, lng);
        const description = typeof props.description === 'string' && props.description.trim() ? props.description.trim() : undefined;
        const createdAt = typeof props.createdAt === 'string' && props.createdAt.trim() ? props.createdAt.trim() : new Date().toISOString();
        const id = typeof props.id === 'string' && props.id.trim() ? props.id.trim() : `point-${Date.now()}-${idx}`;

        points.push({
          id,
          fieldId,
          coordinates: { lat, lng },
          mgrs,
          type,
          description,
          createdAt,
        });
      });

      if (points.length === 0) {
        return {
          success: false,
          points: [],
          error: 'У GeoJSON файлі не знайдено валідних точок моніторингу.',
        };
      }

      return {
        success: true,
        points,
      };
    } catch {
      return {
        success: false,
        points: [],
        error: 'Помилка синтаксису JSON під час парсингу файлу.',
      };
    }
  }

  // Парсинг CSV
  try {
    const cleanContent = content.replace(/^\uFEFF/, '').trim();
    const lines = cleanContent.split(/\r?\n/).filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      return {
        success: false,
        points: [],
        error: 'CSV файл повинен містити рядок заголовків та щонайменше один рядок даних.',
      };
    }

    const firstLine = lines[0];
    if (!firstLine) {
      return {
        success: false,
        points: [],
        error: 'CSV файл порожній.',
      };
    }

    const delimiter = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';
    const headers = parseCsvLine(firstLine, delimiter).map((h) => h.toLowerCase());

    const latIdx = headers.findIndex((h) => h.includes('lat') || h.includes('широт'));
    const lngIdx = headers.findIndex((h) => h.includes('lng') || h.includes('lon') || h.includes('довгот'));

    if (latIdx === -1 || lngIdx === -1) {
      return {
        success: false,
        points: [],
        error: 'У CSV не знайдено обов’язкових колонок широти (Lat) та довготи (Lng).',
      };
    }

    const idIdx = headers.findIndex((h) => h === 'id');
    const fieldIdx = headers.findIndex((h) => h.includes('field') || h.includes('поле'));
    const typeIdx = headers.findIndex((h) => h.includes('тип') || h.includes('type'));
    const mgrsIdx = headers.findIndex((h) => h.includes('mgrs'));
    const descIdx = headers.findIndex((h) => h.includes('опис') || h.includes('desc'));
    const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('дата'));

    const points: MonitoringPoint[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const cols = parseCsvLine(line, delimiter);
      if (cols.length <= Math.max(latIdx, lngIdx)) continue;

      const rawLat = cols[latIdx];
      const rawLng = cols[lngIdx];
      if (!rawLat || !rawLng) continue;

      const lat = parseFloat(rawLat.replace(',', '.'));
      const lng = parseFloat(rawLng.replace(',', '.'));

      if (isNaN(lat) || isNaN(lng)) continue;

      let fieldId = '';
      if (fieldIdx !== -1 && cols[fieldIdx]) {
        const fieldVal = cols[fieldIdx].toLowerCase();
        const found = fields.find(
          (f) => f.properties.id.toLowerCase() === fieldVal || f.properties.name.toLowerCase().includes(fieldVal)
        );
        if (found) fieldId = found.properties.id;
      }

      if (!fieldId) {
        const found = fields.find((f) => isPointInField(lat, lng, f));
        fieldId = found?.properties.id || fields[0]?.properties.id || '';
      }

      const rawType = typeIdx !== -1 && cols[typeIdx] ? cols[typeIdx] : 'OTHER';
      const type = resolvePointType(rawType);
      const mgrs = mgrsIdx !== -1 && cols[mgrsIdx] ? cols[mgrsIdx] : convertWgs84ToMgrs(lat, lng);
      const description = descIdx !== -1 && cols[descIdx] ? cols[descIdx] : undefined;
      const createdAt = dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString();
      const id = idIdx !== -1 && cols[idIdx] ? cols[idIdx] : `point-${Date.now()}-${i}`;

      points.push({
        id,
        fieldId,
        coordinates: { lat, lng },
        mgrs,
        type,
        description,
        createdAt,
      });
    }

    if (points.length === 0) {
      return {
        success: false,
        points: [],
        error: 'У CSV файлі не знайдено валідних рядків з координатами.',
      };
    }

    return {
      success: true,
      points,
    };
  } catch {
    return {
      success: false,
      points: [],
      error: 'Помилка обробки CSV файлу.',
    };
  }
}
