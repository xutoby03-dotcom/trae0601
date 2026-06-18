import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  return (
    <div className="min-h-screen relative">
      <div className="wave-decoration" />
      <Sidebar />
      <main className="ml-64 min-h-screen relative z-10">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
