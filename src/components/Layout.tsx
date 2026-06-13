import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAppStore } from '../store';

export const Layout: React.FC = () => {
  const initData = useAppStore((state) => state.initData);
  const updateOverdueStatus = useAppStore((state) => state.updateOverdueStatus);

  useEffect(() => {
    initData();
    updateOverdueStatus();

    const interval = setInterval(() => {
      updateOverdueStatus();
    }, 60000);

    return () => clearInterval(interval);
  }, [initData, updateOverdueStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8 animate-fadeIn">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
