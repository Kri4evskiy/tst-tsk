import React from 'react';
import { RotateCcw } from 'lucide-react';
import { usePointStore } from '@/entities/point';

export const ResetDataButton: React.FC = () => {
  const { resetPoints } = usePointStore();

  const handleReset = () => {
    if (window.confirm('Скинути всі моніторингові точки до початкових демо-даних?')) {
      resetPoints();
    }
  };

  return (
    <button
      onClick={handleReset}
      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900 text-xs font-medium rounded-xl shadow-2xs transition-colors cursor-pointer"
      title="Скинути до початкових демо-точок"
    >
      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
      <span>Скинути дані</span>
    </button>
  );
};
