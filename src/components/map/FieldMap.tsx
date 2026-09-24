import React, { useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import type { FieldFeature } from '@/types';
import { useFieldStore } from '@/store/useFieldStore';
import { usePointStore } from '@/store/usePointStore';
import { isPointInField, convertWgs84ToMgrs, formatDateTime } from '@/utils/geo';
import { createPointCustomIcon } from './PointMarkerIcon';
import { POINT_TYPE_CONFIGS } from '@/utils/pointTypes';
import { Trash2, Calendar, Navigation, MapPin } from 'lucide-react';

interface MapEventsHandlerProps {
  onValidClick: (lat: number, lng: number, mgrs: string) => void;
  onInvalidClick: (msg: string) => void;
}

// Обробник кліків по карті для валідації Point-in-Polygon
const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({
  onValidClick,
  onInvalidClick,
}) => {
  const { getActiveField } = useFieldStore();

  useMapEvents({
    click: (e) => {
      const activeField = getActiveField();
      if (!activeField) {
        onInvalidClick('Спочатку оберіть поле зі списку.');
        return;
      }

      const { lat, lng } = e.latlng;
      const inside = isPointInField(lat, lng, activeField);

      if (inside) {
        const mgrsCoords = convertWgs84ToMgrs(lat, lng);
        onValidClick(lat, lng, mgrsCoords);
      } else {
        onInvalidClick(
          `Точка повинна бути в межах обраного поля "${activeField.properties.name}".`
        );
      }
    },
  });

  return null;
};

// Контролер авто-центрування та анімацій
const MapCameraController: React.FC = () => {
  const map = useMap();
  const activeFieldId = useFieldStore((state) => state.activeFieldId);
  const fields = useFieldStore((state) => state.fields);
  const focusedPoint = usePointStore((state) => state.focusedPoint);

  // При зміні активного поля плавно центруємо на його контури
  useEffect(() => {
    const activeField = fields.find((f) => f.properties.id === activeFieldId);
    if (activeField) {
      // Конвертуємо GeoJSON [lng, lat] в Leaflet LatLngExpression [lat, lng]
      const latLngs = activeField.geometry.coordinates[0]?.map(
        ([lng, lat]) => [lat, lng] as [number, number]
      );
      if (latLngs && latLngs.length > 0) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, duration: 0.8 });
      }
    }
  }, [map, activeFieldId, fields]);

  // Фокус на конкретну точку зі списку
  useEffect(() => {
    if (focusedPoint) {
      map.flyTo([focusedPoint.coordinates.lat, focusedPoint.coordinates.lng], 16, {
        duration: 1.2,
      });
    }
  }, [map, focusedPoint]);

  return null;
};

// Хук фіксу сірих тайлів при ресайзі контейнера
const MapResizeInvalidator: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 300);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [map]);

  return null;
};

interface FieldMapProps {
  onAddPointClick: (lat: number, lng: number, mgrs: string) => void;
  onErrorToast: (message: string) => void;
}

export const FieldMap: React.FC<FieldMapProps> = ({
  onAddPointClick,
  onErrorToast,
}) => {
  const { fields, activeFieldId, setActiveFieldId } = useFieldStore();
  const { points, deletePoint } = usePointStore();

  // Стилі для полігонів полів
  const fieldStyle = (feature?: FieldFeature) => {
    const isActive = feature?.properties.id === activeFieldId;
    return {
      fillColor: isActive ? '#10b981' : '#64748b',
      weight: isActive ? 3 : 1.5,
      opacity: 1,
      color: isActive ? '#059669' : '#475569',
      fillOpacity: isActive ? 0.35 : 0.15,
      dashArray: isActive ? '' : '4, 4',
    };
  };

  const pointIcons = useMemo(() => {
    return {
      SOIL_SAMPLE: createPointCustomIcon('SOIL_SAMPLE'),
      PESTS: createPointCustomIcon('PESTS'),
      PLANT_DISEASE: createPointCustomIcon('PLANT_DISEASE'),
      OTHER: createPointCustomIcon('OTHER'),
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[50.4200, 30.5100]}
        zoom={14}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapResizeInvalidator />
        <MapCameraController />
        <MapEventsHandler
          onValidClick={onAddPointClick}
          onInvalidClick={onErrorToast}
        />

        {/* Відображення полів */}
        {fields.map((field) => (
          <GeoJSON
            key={`${field.properties.id}-${field.properties.id === activeFieldId}`}
            data={field}
            style={() => fieldStyle(field)}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                if (field.properties.id !== activeFieldId) {
                  // Клік по іншому полю активує його
                  setActiveFieldId(field.properties.id);
                } else {
                  // Клік всередині вже активного поля створює нову точку
                  const { lat, lng } = e.latlng;
                  const mgrsCoords = convertWgs84ToMgrs(lat, lng);
                  onAddPointClick(lat, lng, mgrsCoords);
                }
              },
            }}
            onEachFeature={(_feature, layer) => {
              layer.bindTooltip(
                `<div class="p-1 text-xs">
                  <div class="font-bold text-slate-800">${field.properties.name}</div>
                  <div class="text-slate-600">${field.properties.area} га • ${field.properties.crop}</div>
                </div>`,
                { sticky: true, className: 'rounded-lg shadow-sm border border-slate-200' }
              );
            }}
          />
        ))}

        {/* Відображення моніторингових точок */}
        {points.map((pt) => {
          const config = POINT_TYPE_CONFIGS[pt.type];
          const ptField = fields.find((f) => f.properties.id === pt.fieldId);
          return (
            <Marker
              key={pt.id}
              position={[pt.coordinates.lat, pt.coordinates.lng]}
              icon={pointIcons[pt.type]}
            >
              <Popup>
                <div className="p-3.5 min-w-[240px] text-slate-800">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                    <div>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: config.bgColor,
                          color: config.borderColor,
                        }}
                      >
                        {config.label}
                      </span>
                      {ptField && (
                        <div className="text-[10px] text-slate-400 font-medium mt-1">
                          {ptField.properties.name}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => deletePoint(pt.id)}
                      className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Видалити точку"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {pt.description && (
                    <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                      "{pt.description}"
                    </p>
                  )}

                  <div className="space-y-1.5 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 font-mono">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{pt.coordinates.lat}, {pt.coordinates.lng}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <Navigation className="w-3 h-3 text-indigo-500" />
                      <span className="font-semibold text-slate-700">{pt.mgrs}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 pt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDateTime(pt.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Інформаційна плашка-підказка */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-md border border-slate-200/80 text-xs text-slate-700 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Клікніть всередині активного поля, щоб додати точку</span>
      </div>
    </div>
  );
};
