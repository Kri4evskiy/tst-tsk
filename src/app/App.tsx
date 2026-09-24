import React from 'react';
import { MapPage } from '@/pages/map';
import { Toast } from '@/shared/ui';

export const App: React.FC = () => {
  return (
    <>
      <MapPage />
      {/* Глобальний контейнер сповіщень для всього застосунку */}
      <Toast />
    </>
  );
};

export default App;
