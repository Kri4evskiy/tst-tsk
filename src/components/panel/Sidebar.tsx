import React, { useMemo } from 'react';
import { useFieldStore } from '@/store/useFieldStore';
import { usePointStore } from '@/store/usePointStore';
import { POINT_TYPE_CONFIGS } from '@/utils/pointTypes';
import { formatDateTime } from '@/utils/geo';
import type { PointType } from '@/types';
import {
  Layers,
  MapPin,
  Search,
  ArrowUpDown,
  Trash2,
  Navigation,
  Calendar,
  Sprout,
  CheckCircle2,
} from 'lucide-react';

interface SidebarProps {
  onSelectPoint?: () => void;
  onSelectField?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectPoint, onSelectField }) => {
  const { fields, activeFieldId, setActiveFieldId } = useFieldStore();
  const {
    points,
    searchQuery,
    selectedType,
    sortOrder,
    deletePoint,
    setSearchQuery,
    setSelectedType,
    setSortOrder,
    setFocusedPoint,
  } = usePointStore();

  // Фільтрація та сортування списку точок
  const filteredPoints = useMemo(() => {
    let result = [...points];

    // Фільтр за типом
    if (selectedType !== 'ALL') {
      result = result.filter((p) => p.type === selectedType);
    }

    // Пошук за описом, MGRS або назвою типу (case-insensitive)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const typeLabel = POINT_TYPE_CONFIGS[p.type]?.label.toLowerCase() || '';
        const field = fields.find((f) => f.properties.id === p.fieldId);
        const fieldName = field?.properties.name.toLowerCase() || '';
        return (
          p.description?.toLowerCase().includes(q) ||
          p.mgrs.toLowerCase().includes(q) ||
          typeLabel.includes(q) ||
          fieldName.includes(q)
        );
      });
    }

    // Сортування за датою
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [points, selectedType, searchQuery, sortOrder, fields]);

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800 tracking-tight">
              AgTech Fields GIS
            </h1>
            <p className="text-[11px] text-slate-500">
              Управління полями та моніторингом
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Секція 1: Поля */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Layers className="w-4 h-4 text-emerald-600" />
              Сільгосп поля ({fields.length})
            </h2>
          </div>

          <div className="grid gap-2">
            {fields.map((field) => {
              const isActive = field.properties.id === activeFieldId;
              const fieldPointsCount = points.filter(
                (p) => p.fieldId === field.properties.id
              ).length;

              return (
                <div
                  key={field.properties.id}
                  onClick={() => {
                    setActiveFieldId(field.properties.id);
                    onSelectField?.();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
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
                      {fieldPointsCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Секція 2: Точки моніторингу */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Моніторингові точки ({filteredPoints.length})
            </h2>

            {/* Сортування */}
            <button
              onClick={() =>
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
              }
              className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 cursor-pointer transition-colors"
              title="Перемкнути порядок сортування за датою"
            >
              <ArrowUpDown className="w-3 h-3 text-slate-400" />
              {sortOrder === 'desc' ? 'Спочатку нові' : 'Спочатку старі'}
            </button>
          </div>

          {/* Пошук та фільтр */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Пошук за описом або MGRS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            {/* Фільтр за категорією */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedType('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                  selectedType === 'ALL'
                    ? 'bg-slate-800 text-white'
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
                    onClick={() => setSelectedType(key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {conf.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Список точок */}
          <div className="space-y-2">
            {filteredPoints.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
                Точок не знайдено
              </div>
            ) : (
              filteredPoints.map((point) => {
                const config = POINT_TYPE_CONFIGS[point.type];
                const pointField = fields.find((f) => f.properties.id === point.fieldId);
                return (
                  <div
                    key={point.id}
                    onClick={() => {
                      setActiveFieldId(point.fieldId);
                      setFocusedPoint(point);
                      onSelectPoint?.();
                    }}
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
                        {pointField && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {pointField.properties.name}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePoint(point.id);
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
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
