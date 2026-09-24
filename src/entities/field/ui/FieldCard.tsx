import React from 'react';
import type { FieldFeature } from '../model/types';
import { CheckCircle2 } from 'lucide-react';

interface FieldCardProps {
  field: FieldFeature;
  isActive: boolean;
  pointsCount: number;
  onSelect: () => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({
  field,
  isActive,
  pointsCount,
  onSelect,
}) => {
  return (
    <article
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      aria-label={`${field.properties.name}, площа ${field.properties.area} гектарів, культура ${field.properties.crop}`}
      className={`p-3 rounded-xl border transition-all cursor-pointer relative outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
        isActive
          ? 'bg-emerald-50/70 border-emerald-500 shadow-sm'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3
            className={`text-sm font-semibold ${
              isActive ? 'text-emerald-900' : 'text-slate-800'
            }`}
          >
            {field.properties.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span className="font-medium text-slate-600">
              {field.properties.area} га
            </span>
            <span>•</span>
            <span>{field.properties.crop}</span>
          </div>
        </div>

        {isActive && (
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        )}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Точок моніторингу:</span>
        <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
          {pointsCount}
        </span>
      </div>
    </article>
  );
};
