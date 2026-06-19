import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { zhCN } from 'date-fns/locale';
import { setDefaultOptions } from 'date-fns';
import App from './App.js';
import './index.css';
import { useStore } from './store/useStore.js';

setDefaultOptions({ locale: zhCN });

function AppInitializer() {
  const { fetchCurrentUser, fetchGardenBeds, fetchVolunteers, fetchWeather } = useStore();

  useEffect(() => {
    fetchCurrentUser();
    fetchGardenBeds();
    fetchVolunteers();
    fetchWeather();
  }, [fetchCurrentUser, fetchGardenBeds, fetchVolunteers, fetchWeather]);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppInitializer />
  </StrictMode>
);
