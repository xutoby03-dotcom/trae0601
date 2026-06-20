import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface LayoutProps {
  title: string;
  subtitle?: string;
}

export default function Layout({ title, subtitle }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
            {subtitle && <p className="text-gray-500">{subtitle}</p>}
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
