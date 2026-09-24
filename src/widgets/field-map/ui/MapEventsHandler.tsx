import React from 'react';
import { useMapEvents } from 'react-leaflet';
import { useFieldStore } from '@/entities/field';
import { useAddPointModalStore } from '@/features/add-point';
import { useToastStore } from '@/shared/ui';
import { isPointInField, convertWgs84ToMgrs } from '@/shared/lib/geo/geo';

interface MapEventsHandlerProps {
  onValidClick?: (lat: number, lng: number, mgrs: string) => void;
  onInvalidClick?: (msg: string) => void;
}

export const MapEventsHandler: React.FC<MapEventsHandlerProps> = ({
  onValidClick,
  onInvalidClick,
}) => {
  const { getActiveField } = useFieldStore();
  const openModal = useAddPointModalStore((s) => s.openModal);
  const showToast = useToastStore((s) => s.showToast);

  useMapEvents({
    click: (e) => {
      const activeField = getActiveField();
      if (!activeField) {
        const msg = 'Спочатку оберіть поле зі списку.';
        if (onInvalidClick) onInvalidClick(msg);
        else showToast(msg, 'error');
        return;
      }

      const { lat, lng } = e.latlng;
      const inside = isPointInField(lat, lng, activeField);

      if (inside) {
        const mgrsCoords = convertWgs84ToMgrs(lat, lng);
        if (onValidClick) onValidClick(lat, lng, mgrsCoords);
        else openModal({ lat, lng, mgrs: mgrsCoords });
      } else {
        const msg = `Точка повинна бути в межах обраного поля "${activeField.properties.name}".`;
        if (onInvalidClick) onInvalidClick(msg);
        else showToast(msg, 'error');
      }
    },
  });

  return null;
};
