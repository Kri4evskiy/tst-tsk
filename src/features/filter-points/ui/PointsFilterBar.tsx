import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { POINT_TYPE_CONFIGS, type PointType } from '@/shared/config/pointTypes';
import type { SortOrder } from '@/entities/point';

interface PointsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: PointType | 'ALL';
  onTypeChange: (type: PointType | 'ALL') => void;
  sortOrder: SortOrder;
  onSortToggle: () => void;
}

export const PointsFilterBar: React.FC<PointsFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  sortOrder,
  onSortToggle,
}) => {
  return (
    <div className="space-y-2">
      {/* Семантичний пошуковий контейнер search */}
      <search role="search" className="flex items-center gap-2">
        <div className="relative flex-1">
          <label htmlFor="points-search-input" className="sr-only">
            Пошук моніторингових точок за описом, MGRS або назвою поля
          </label>
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          <input
            id="points-search-input"
            type="search"
            placeholder="Пошук за описом, MGRS, полем..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        <button
          type="button"
          onClick={onSortToggle}
          aria-label={`Сортування за датою: зараз ${sortOrder === 'desc' ? 'спочатку нові' : 'спочатку старі'}`}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white px-2.5 py-2 rounded-xl border border-slate-200 cursor-pointer transition-colors shrink-0"
          title="Перемкнути сортування за датою"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">
            {sortOrder === 'desc' ? 'Нові' : 'Старі'}
          </span>
        </button>
      </search>

      {/* Семантична панель інструментів фільтрації (toolbar) */}
      <div
        role="toolbar"
        aria-label="Фільтрація точок за категоріями замірів"
        className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      >
        <button
          type="button"
          onClick={() => onTypeChange('ALL')}
          aria-pressed={selectedType === 'ALL'}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
            selectedType === 'ALL'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Всі
        </button>
        {(Object.keys(POINT_TYPE_CONFIGS) as PointType[]).map((key) => {
          const conf = POINT_TYPE_CONFIGS[key];
          const isSelected = selectedType === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTypeChange(key)}
              aria-pressed={isSelected}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {conf.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
