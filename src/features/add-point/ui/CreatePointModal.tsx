import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/shared/ui';
import { usePointStore, type MonitoringPoint } from '@/entities/point';
import { useFieldStore } from '@/entities/field';
import { POINT_TYPE_CONFIGS, type PointType } from '@/shared/config/pointTypes';
import { MapPin, Navigation, Tag, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useAddPointModalStore } from '../model/useAddPointModalStore';

export interface CreatePointModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  fieldId?: string;
  lat?: number;
  lng?: number;
  mgrs?: string;
}

interface CreatePointFormData {
  type: PointType;
  description: string;
}

function generatePointId(): string {
  return `point-${Date.now()}`;
}

export const CreatePointModal: React.FC<CreatePointModalProps> = (props) => {
  const storeModal = useAddPointModalStore();
  const { activeFieldId } = useFieldStore();
  const { addPoint } = usePointStore();

  const isOpen = props.isOpen !== undefined ? props.isOpen : storeModal.isOpen;
  const onClose = props.onClose ?? storeModal.closeModal;
  const fieldId = props.fieldId ?? activeFieldId;
  const lat = props.lat !== undefined ? props.lat : storeModal.lat;
  const lng = props.lng !== undefined ? props.lng : storeModal.lng;
  const mgrs = props.mgrs !== undefined ? props.mgrs : storeModal.mgrs;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePointFormData>({
    defaultValues: {
      type: 'SOIL_SAMPLE',
      description: '',
    },
  });

  // Скидання полів форми при закритті модального вікна
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = (data: CreatePointFormData) => {
    const newPoint: MonitoringPoint = {
      id: generatePointId(),
      fieldId,
      coordinates: {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      },
      mgrs,
      type: data.type,
      description: data.description.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    addPoint(newPoint);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Додати моніторингову точку">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Семантична секція інформації про координати */}
        <section
          aria-label="Географічні координати заміру"
          className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs"
        >
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
        </section>

        {/* Семантична група полів форми (fieldset) */}
        <fieldset className="space-y-4 border-0 p-0 m-0">
          <legend className="sr-only">Параметри моніторингової точки</legend>

          {/* Point Type */}
          <div>
            <label
              htmlFor="point-type-select"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Тип моніторингу
            </label>
            <select
              id="point-type-select"
              {...register('type', { required: 'Оберіть тип моніторингу' })}
              aria-invalid={errors.type ? 'true' : 'false'}
              className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 transition-all cursor-pointer ${
                errors.type
                  ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            >
              {Object.entries(POINT_TYPE_CONFIGS).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p role="alert" className="flex items-center gap-1 mt-1 text-xs text-rose-600">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="point-description-input"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Опис (опціонально)
            </label>
            <textarea
              id="point-description-input"
              {...register('description', {
                maxLength: {
                  value: 250,
                  message: 'Опис не повинен перевищувати 250 символів',
                },
              })}
              aria-invalid={errors.description ? 'true' : 'false'}
              placeholder="Введіть спостереження або деталі заміру..."
              rows={3}
              className={`w-full px-3.5 py-2 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.description
                  ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500'
              }`}
            />
            {errors.description && (
              <p role="alert" className="flex items-center gap-1 mt-1 text-xs text-rose-600">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.description.message}
              </p>
            )}
          </div>
        </fieldset>

        {/* Семантичний підвал форми (footer) з діями */}
        <footer className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Скасувати
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-xl shadow-sm shadow-emerald-700/20 transition-all cursor-pointer"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Зберегти точку</span>
          </button>
        </footer>
      </form>
    </Modal>
  );
};
