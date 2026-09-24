import React, { useState } from 'react';
import { Modal } from '@/shared/ui';
import { usePointStore, type MonitoringPoint } from '@/entities/point';
import { POINT_TYPE_CONFIGS, type PointType } from '@/shared/config/pointTypes';
import { MapPin, Navigation, Tag, FileText } from 'lucide-react';

export interface CreatePointModalProps {
  isOpen: boolean;
  onClose: () => void;
  fieldId: string;
  lat: number;
  lng: number;
  mgrs: string;
}

export const CreatePointModal: React.FC<CreatePointModalProps> = ({
  isOpen,
  onClose,
  fieldId,
  lat,
  lng,
  mgrs,
}) => {
  const { addPoint } = usePointStore();
  const [type, setType] = useState<PointType>('SOIL_SAMPLE');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPoint: MonitoringPoint = {
      id: `point-${Date.now()}`,
      fieldId,
      coordinates: {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      },
      mgrs,
      type,
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    addPoint(newPoint);
    setDescription('');
    setType('SOIL_SAMPLE');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Додати моніторингову точку">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Coordinates Section */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
          <div>
            <span className="flex items-center gap-1.5 font-medium text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              WGS 84 (Lat, Lng)
            </span>
            <span className="font-mono font-semibold text-slate-800">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
          </div>
          <div>
            <span className="flex items-center gap-1.5 font-medium text-slate-500 mb-1">
              <Navigation className="w-3.5 h-3.5 text-indigo-600" />
              MGRS Grid
            </span>
            <span className="font-mono font-semibold text-slate-800">
              {mgrs}
            </span>
          </div>
        </div>

        {/* Point Type */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Тип моніторингу
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PointType)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
          >
            {Object.entries(POINT_TYPE_CONFIGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Опис (опціонально)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введіть спостереження або деталі заміру..."
            rows={3}
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Скасувати
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm shadow-emerald-700/20 transition-all cursor-pointer"
          >
            Зберегти точку
          </button>
        </div>
      </form>
    </Modal>
  );
};
