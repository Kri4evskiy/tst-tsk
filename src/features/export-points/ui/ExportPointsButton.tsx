import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  FileJson,
  FileSpreadsheet,
  FileUp,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import type { MonitoringPoint } from '@/entities/point';
import { usePointStore } from '@/entities/point';
import { useFieldStore } from '@/entities/field';
import { useToastStore } from '@/shared/ui';
import { exportToGeoJSON, exportToCSV } from '../lib/exportUtils';
import { parseImportFileContent } from '../lib/importUtils';

interface ExportPointsButtonProps {
  points: MonitoringPoint[];
}

export const ExportPointsButton: React.FC<ExportPointsButtonProps> = ({ points }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { fields } = useFieldStore();
  const { importPoints } = usePointStore();
  const { showToast } = useToastStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportGeoJSON = () => {
    exportToGeoJSON(points, fields);
    setIsOpen(false);
    showToast(`Експортовано ${points.length} точок у GeoJSON`, 'info');
  };

  const handleExportCSV = () => {
    exportToCSV(points, fields);
    setIsOpen(false);
    showToast(`Експортовано ${points.length} точок у CSV`, 'info');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = parseImportFileContent(text, file.name, fields);

      if (result.success && result.points.length > 0) {
        const added = importPoints(result.points);
        showToast(`Успішно імпортовано ${added} точок з файлу "${file.name}"!`, 'success');
      } else {
        showToast(result.error || 'Не вдалося розпізнати точки у файлі.', 'error');
      }
    } catch {
      showToast('Помилка читання файлу на клієнті.', 'error');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsOpen(false);
    }
  };

  const handleLoadMockSample = async () => {
    try {
      const res = await fetch('/samples/monitoring-points-sample.geojson');
      if (!res.ok) throw new Error('Файл не знайдено');
      const text = await res.text();
      const result = parseImportFileContent(text, 'monitoring-points-sample.geojson', fields);

      if (result.success && result.points.length > 0) {
        const added = importPoints(result.points);
        showToast(`Завантажено ${added} точок з еталонного мок-файлу!`, 'success');
      } else {
        showToast(result.error || 'Помилка завантаження мокових даних.', 'error');
      }
    } catch {
      showToast('Не вдалося завантажити моковий файл з сервера.', 'error');
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Прихований input для вибору файлів */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".geojson,.json,.csv"
        className="hidden"
      />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-medium rounded-xl shadow-2xs transition-colors cursor-pointer"
        title="Експорт та імпорт моніторингових даних"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
        <span>Дані</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
          {/* Секція: Експорт */}
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Експорт даних ({points.length})
          </div>
          <button
            onClick={handleExportGeoJSON}
            disabled={points.length === 0}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors text-left cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>GeoJSON (.geojson)</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={points.length === 0}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors text-left cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Таблиця Excel (.csv)</span>
          </button>

          {/* Розділювач */}
          <div className="my-1.5 border-t border-slate-100" />

          {/* Секція: Імпорт */}
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Імпорт та зразки
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
          >
            <FileUp className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>Імпортувати GeoJSON / CSV</span>
          </button>
          <button
            onClick={handleLoadMockSample}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Завантажити демо-зразок</span>
          </button>
        </div>
      )}
    </div>
  );
};
