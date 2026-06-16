import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initMockData } from '@/data/mockData'

function AppInitializer() {
  useEffect(() => {
    const init = async () => {
      try {
        await initMockData();
        console.log('[App] Mock data initialized successfully');
      } catch (error) {
        console.error('[App] Failed to initialize mock data:', error);
      }
    };
    init();
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppInitializer />
  </StrictMode>,
)
