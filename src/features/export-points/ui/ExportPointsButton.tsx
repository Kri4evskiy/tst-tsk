import React, { useState, useRef, useEffect } from 'react';
import { Download, ChevronDown, FileJson, FileSpreadsheet } from 'lucide-react';
import type { MonitoringPoint } from '@/entities/point';
import { useFieldStore } from '@/entities/field';
import { exportToGeoJSON, exportToCSV } from '../lib/exportUtils';

interface ExportPointsButtonProps {
  points: MonitoringPoint[];
}

export const ExportPointsButton: React.FC<ExportPointsButtonProps> = ({ points }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { fields } = useFieldStore();

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
  };

  const handleExportCSV = () => {
    exportToCSV(points, fields);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={points.length === 0}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium rounded-xl shadow-2xs transition-colors cursor-pointer"
        title="Експорт точок"
      >
        <Download className="w-3.5 h-3.5 text-slate-500" />
        <span>Експорт</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={handleExportGeoJSON}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-emerald-600" />
            <span>GeoJSON (.geojson)</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors text-left cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
            <span>Таблиця Excel (.csv)</span>
          </button>
        </div>
      )}
    </div>
  );
};
