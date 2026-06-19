import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  CloudRain,
  Wrench,
  Droplets,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/areas', label: '区域档案', icon: MapPin },
  { path: '/inspections', label: '雨后检查', icon: CloudRain },
  { path: '/tasks', label: '维修任务', icon: Wrench },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-100">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231e3a5f' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <header className="relative bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-wide">露台防水排查</h1>
              <p className="text-xs text-blue-100">Terrace Waterproof Inspection</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-inner'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <nav className="md:hidden bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 py-3 flex flex-col items-center gap-1 text-xs transition-colors ${
                  isActive ? 'text-primary-500 bg-primary-50' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 relative animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
