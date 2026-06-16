import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function MainLayout() {
  return (
    <div className="flex min-h-screen bg-warm-50">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
