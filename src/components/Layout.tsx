import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Stamp,
  FileSignature,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { useStore } from '@/store';
import { useEffect } from 'react';

const navItems = [
  { path: '/dashboard', label: '数据看板', icon: LayoutDashboard },
  { path: '/seals', label: '印章档案', icon: Stamp },
  { path: '/applications', label: '外带申请', icon: FileSignature },
];

export default function Layout() {
  const location = useLocation();
  const checkOverdue = useStore((s) => s.checkOverdue);
  const pendingCount = useStore((s) => s.applications.filter((a) => a.status === 'pending').length);
  const overdueCount = useStore(
    (s) =>
      s.applications.filter((a) => a.status === 'overdue').length +
      s.records.filter((r) => r.status === 'overdue').length
  );

  useEffect(() => {
    checkOverdue();
    const interval = setInterval(checkOverdue, 60000);
    return () => clearInterval(interval);
  }, [checkOverdue]);

  return (
    <div className="min-h-screen flex bg-seal-bg paper-texture">
      <aside className="w-64 bg-primary-800 text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gold-border-gradient flex items-center justify-center">
              <Stamp className="w-5 h-5 text-primary-900" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-semibold">印章管理</h1>
              <p className="text-xs text-primary-300">外带登记系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-700 text-white shadow-inner border-l-4 border-gold-400'
                    : 'text-primary-200 hover:bg-primary-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.path === '/applications' && pendingCount > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-amber-400 text-primary-900 text-xs flex items-center justify-center font-bold">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {overdueCount > 0 && (
          <div className="mx-3 mb-4 p-4 rounded-lg bg-red-900/50 border border-red-700">
            <div className="flex items-center gap-2 text-red-200">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium">
                <span className="text-red-300 font-bold">{overdueCount}</span> 项逾期提醒
              </span>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-200" />
            </div>
            <div>
              <p className="text-sm font-medium">行政部</p>
              <p className="text-xs text-primary-400">印章管理员</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-[1440px] mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
