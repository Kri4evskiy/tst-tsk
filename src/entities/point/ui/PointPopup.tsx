import React from 'react';
import type { MonitoringPoint } from '../model/types';
import { POINT_TYPE_CONFIGS } from '@/shared/config/pointTypes';
import { formatDateTime } from '@/shared/lib/format/formatters';
import { Trash2, Calendar, Navigation, MapPin } from 'lucide-react';

interface PointPopupProps {
  point: MonitoringPoint;
  fieldName?: string;
  onDelete: () => void;
}

export const PointPopup: React.FC<PointPopupProps> = ({
  point,
  fieldName,
  onDelete,
}) => {
  const config = POINT_TYPE_CONFIGS[point.type];

  return (
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
          {fieldName && (
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              {fieldName}
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
          title="Видалити точку"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {point.description && (
        <p className="text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
          "{point.description}"
        </p>
      )}

      <div className="space-y-1.5 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5 font-mono">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{point.coordinates.lat}, {point.coordinates.lng}</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <Navigation className="w-3 h-3 text-indigo-500" />
          <span className="font-semibold text-slate-700">{point.mgrs}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 pt-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDateTime(point.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
