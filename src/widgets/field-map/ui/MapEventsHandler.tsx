import React from 'react';
import { useMapEvents } from 'react-leaflet';
import { useFieldStore } from '@/entities/field';
import { isPointInField, convertWgs84ToMgrs } from '@/shared/lib/geo/geo';

interface MapEventsHandlerProps {
  onValidClick: (lat: number, lng: number, mgrs: string) => void;
  onInvalidClick: (msg: string) => void;
}

export const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({
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
