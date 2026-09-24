import React, { useMemo, useRef, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import { useFieldStore } from '@/entities/field';
import { usePointStore, createPointCustomIcon, PointPopup } from '@/entities/point';
import { convertWgs84ToMgrs } from '@/shared/lib/geo/geo';
import { useBasemapStore, BasemapSwitcher } from '@/features/toggle-basemap';
import { useAddPointModalStore } from '@/features/add-point';
import { BASEMAPS } from '@/shared/config/basemaps';
import { MapCameraController } from './MapCameraController';
import { MapEventsHandler } from './MapEventsHandler';
import { MapResizeInvalidator } from './MapResizeInvalidator';

interface FieldMapProps {
  onAddPointClick?: (lat: number, lng: number, mgrs: string) => void;
  onErrorToast?: (message: string) => void;
}

export const FieldMap: React.FC<FieldMapProps> = ({
  onAddPointClick,
  onErrorToast,
}) => {
  const { fields, activeFieldId, setActiveFieldId } = useFieldStore();
  const { points, deletePoint, setFocusedPoint } = usePointStore();
  const activeBasemap = useBasemapStore((state) => state.activeBasemap);
  const openAddPointModal = useAddPointModalStore((state) => state.openModal);
  const basemapConfig = BASEMAPS[activeBasemap];

  // Зберігаємо посилання на Leaflet GeoJSON шари для плавного setStyle без перемотування DOM
  const geoJsonRefs = useRef<Record<string, L.GeoJSON>>({});

  // Адаптивні стилі для полігонів полів (контрастні на супутнику та гармонійні на схемі)
  const getFieldStyle = React.useCallback(
    (fieldId: string) => {
      const isActive = fieldId === activeFieldId;
      const isSatellite = activeBasemap === 'satellite';

      if (isSatellite) {
        // Контрастний стиль для темного фото-шару Супутника Esri
        return {
          fillColor: isActive ? '#10b981' : '#ffffff',
          weight: isActive ? 3.5 : 2,
          opacity: 1,
          color: isActive ? '#34d399' : '#f8fafc',
          fillOpacity: isActive ? 0.35 : 0.14,
          dashArray: isActive ? '' : '6, 6',
        };
      }

      // Збалансований стиль для світлої векторної підкладки Voyager
      return {
        fillColor: isActive ? '#10b981' : '#64748b',
        weight: isActive ? 3 : 1.5,
        opacity: 1,
        color: isActive ? '#059669' : '#475569',
        fillOpacity: isActive ? 0.35 : 0.15,
        dashArray: isActive ? '' : '4, 4',
      };
    },
    [activeFieldId, activeBasemap]
  );

  // Оновлюємо стилі полігонів на льоту через setStyle (запобігає перемотуванню DOM та артефактам контуру)
  useEffect(() => {
    fields.forEach((field) => {
      const layer = geoJsonRefs.current[field.properties.id];
      if (layer) {
        layer.setStyle(getFieldStyle(field.properties.id));
      }
    });
  }, [fields, getFieldStyle]);

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
        center={[50.42, 30.51]}
        zoom={14}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          key={basemapConfig.id}
          attribution={basemapConfig.attribution}
          url={basemapConfig.url}
          maxZoom={basemapConfig.maxZoom}
        />

        <MapResizeInvalidator />
        <MapCameraController />
        <MapEventsHandler
          onValidClick={onAddPointClick}
          onInvalidClick={onErrorToast}
        />

        {/* Відображення контурів полів */}
        {fields.map((field) => (
          <GeoJSON
            key={field.properties.id}
            ref={(node) => {
              if (node) {
                geoJsonRefs.current[field.properties.id] = node;
              }
            }}
            data={field}
            style={() => getFieldStyle(field.properties.id)}
            eventHandlers={{
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                if (field.properties.id !== activeFieldId) {
                  // Вибір нового поля: скидаємо фокус точки та перемикаємо поле
                  setFocusedPoint(null);
                  setActiveFieldId(field.properties.id);
                } else {
                  // Клік по вже активному полю створює нову точку
                  const { lat, lng } = e.latlng;
                  const mgrsCoords = convertWgs84ToMgrs(lat, lng);
                  if (onAddPointClick) {
                    onAddPointClick(lat, lng, mgrsCoords);
                  } else {
                    openAddPointModal({ lat, lng, mgrs: mgrsCoords });
                  }
                }
              },
            }}
            onEachFeature={(_feature, layer) => {
              layer.bindTooltip(
                `<div class="p-1 text-xs">
                  <div class="font-bold text-slate-800">${field.properties.name}</div>
                  <div class="text-slate-600">${field.properties.area} га • ${field.properties.crop}</div>
                </div>`,
                {
                  sticky: true,
                  className: 'rounded-lg shadow-sm border border-slate-200 bg-white font-sans',
                }
              );
            }}
          />
        ))}

        {/* Відображення моніторингових точок */}
        {points.map((pt) => {
          const ptField = fields.find((f) => f.properties.id === pt.fieldId);
          return (
            <Marker
              key={pt.id}
              position={[pt.coordinates.lat, pt.coordinates.lng]}
              icon={pointIcons[pt.type]}
            >
              <Popup>
                <PointPopup
                  point={pt}
                  fieldName={ptField?.properties.name}
                  onDelete={() => deletePoint(pt.id)}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Верхня плашка-підказка */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-md border border-slate-200/80 text-xs text-slate-700 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Клікніть всередині активного поля, щоб додати точку</span>
      </div>

      {/* Перемикач підкладки карти (Схема / Супутник) */}
      <div className="absolute top-4 right-4 z-10">
        <BasemapSwitcher />
      </div>
    </div>
  );
};
