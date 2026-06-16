import { useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />

      <div className="flex flex-1 flex-col min-w-0">
        <Header onMenuClick={handleMenuClick} />

        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          <div className="p-4 sm:p-6 lg:p-8">
            {children || <Outlet />}
          </div>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
