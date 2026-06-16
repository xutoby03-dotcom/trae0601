import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  title: string;
  subtitle?: string;
}

export default function MainLayout({ title, subtitle }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-warm-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-warm-100 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-semibold text-brown-800">{title}</h2>
              {subtitle && <p className="text-sm text-brown-500 mt-1">{subtitle}</p>}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
