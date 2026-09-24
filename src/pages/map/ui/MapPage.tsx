import React from 'react';
import { FieldMap } from '@/widgets/field-map';
import { ManagementSidebar } from '@/widgets/management-sidebar';
import { CreatePointModal } from '@/features/add-point';
import { useNavigationStore } from '@/shared/model';
import { Map as MapIcon, List } from 'lucide-react';

export const MapPage: React.FC = () => {
  const { activeTab, setActiveTab } = useNavigationStore();

  return (
    <div className="flex h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      {/* Сайдбар: для Desktop (≥ 1024px) відображається постійно зліва, для Tablet/Mobile залежить від activeTab */}
      <div
        className={`w-full lg:w-[400px] xl:w-[440px] shrink-0 h-full ${
          activeTab === 'sidebar' ? 'block' : 'hidden lg:block'
        }`}
      >
        <ManagementSidebar />
      </div>

      {/* Інтерактивна мапа */}
      <div
        className={`flex-1 h-full relative ${
          activeTab === 'map' ? 'block' : 'hidden lg:block'
        }`}
      >
        <FieldMap />
      </div>

      {/* Мобільні/планшетні кнопки швидкого перемикання (нижня плаваюча панель на < 1024px) */}
      <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-slate-200 flex items-center gap-1">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'map'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          Карта
        </button>
        <button
          onClick={() => setActiveTab('sidebar')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'sidebar'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          Поля та Точки
        </button>
      </div>

      {/* Модальне вікно створення точки (керується через useAddPointModalStore) */}
      <CreatePointModal />
    </div>
  );
};
