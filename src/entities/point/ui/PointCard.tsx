import React from 'react';
import type { MonitoringPoint } from '../model/types';
import { POINT_TYPE_CONFIGS } from '@/shared/config/pointTypes';
import { formatDateTime } from '@/shared/lib/format/formatters';
import { Trash2, Navigation, Calendar } from 'lucide-react';

interface PointCardProps {
  point: MonitoringPoint;
  fieldName?: string;
  onSelect: () => void;
  onDelete: () => void;
}

export const PointCard: React.FC<PointCardProps> = ({
  point,
  fieldName,
  onSelect,
  onDelete,
}) => {
  const config = POINT_TYPE_CONFIGS[point.type];

  return (
    <div
      onClick={onSelect}
      className="p-3 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
            style={{
              backgroundColor: config.bgColor,
              color: config.borderColor,
            }}
          >
            {config.label}
          </span>
          {fieldName && (
            <span className="text-[10px] text-slate-400 font-medium">
              • {fieldName}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
          title="Видалити"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {point.description && (
        <p className="text-xs text-slate-700 font-medium line-clamp-2 mb-2">
          {point.description}
        </p>
      )}

      <div className="space-y-1 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-indigo-500 shrink-0" />
          <span className="truncate">{point.mgrs}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 font-sans pt-1 border-t border-slate-100 text-[10px]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDateTime(point.createdAt)}
          </span>
          <span className="text-emerald-600 font-semibold group-hover:underline">
            Показати на карті →
          </span>
        </div>
      </div>
    </div>
  );
};
