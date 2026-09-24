import React from 'react';
import { Map as MapIcon, Satellite } from 'lucide-react';
import { useBasemapStore } from '../model/useBasemapStore';

export const BasemapSwitcher: React.FC = () => {
  const { activeBasemap, setBasemap } = useBasemapStore();

  return (
    <div className="bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/80 flex items-center gap-1">
      <button
        onClick={() => setBasemap('streets')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          activeBasemap === 'streets'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Схема карти"
      >
        <MapIcon className="w-3.5 h-3.5" />
        <span>Схема</span>
      </button>

      <button
        onClick={() => setBasemap('satellite')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
          activeBasemap === 'satellite'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Супутниковий знімок"
      >
        <Satellite className="w-3.5 h-3.5" />
        <span>Супутник</span>
      </button>
    </div>
  );
};
