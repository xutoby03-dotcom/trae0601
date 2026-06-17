import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function Layout() {
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="ml-60">
        <Topbar />
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
