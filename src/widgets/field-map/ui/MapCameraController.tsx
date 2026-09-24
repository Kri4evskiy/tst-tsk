import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useFieldStore } from '@/entities/field';
import { usePointStore } from '@/entities/point';

export const MapCameraController: React.FC = () => {
  const map = useMap();
  const activeFieldId = useFieldStore((state) => state.activeFieldId);
  const fields = useFieldStore((state) => state.fields);
  const focusedPoint = usePointStore((state) => state.focusedPoint);

  const prevFocusedPointIdRef = useRef<string | null>(null);

  // Центрування на контури активного поля при зміні activeFieldId
  useEffect(() => {
    // Якщо одночасно сфокусовано конкретну точку, не конфліктуємо з flyTo
    if (focusedPoint) return;

    const activeField = fields.find((f) => f.properties.id === activeFieldId);
    if (activeField) {
      const latLngs = activeField.geometry.coordinates[0]?.map(
        ([lng, lat]) => [lat, lng] as [number, number]
      );
      if (latLngs && latLngs.length > 0) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, duration: 0.8 });
      }
    }
  }, [map, activeFieldId, fields, focusedPoint]);

  // Плавний фокус на конкретну точку зі списку
  useEffect(() => {
    if (focusedPoint) {
      map.flyTo([focusedPoint.coordinates.lat, focusedPoint.coordinates.lng], 16, {
        duration: 1.0,
      });
      prevFocusedPointIdRef.current = focusedPoint.id;
    }
  }, [map, focusedPoint]);

  return null;
};
