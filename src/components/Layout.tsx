import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAppStore } from '@/store/useAppStore';

export function Layout() {
  const location = useLocation();
  const initMockData = useAppStore((state) => state.initMockData);
  const checkAndHandleTimeout = useAppStore((state) => state.checkAndHandleTimeout);
  const initialized = useAppStore((state) => state.initialized);
  const isDisplayPage = location.pathname === '/display';
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current && !initialized) {
      initRef.current = true;
      initMockData();
    }
  }, [initMockData, initialized]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkAndHandleTimeout();
    }, 10000);

    return () => clearInterval(interval);
  }, [checkAndHandleTimeout]);

  if (isDisplayPage) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
