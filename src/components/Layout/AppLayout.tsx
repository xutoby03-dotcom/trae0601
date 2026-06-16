import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-dark-950">
      <div className="bg-aurora" />
      <Sidebar />
      <main className="ml-64 min-h-screen relative z-10">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
