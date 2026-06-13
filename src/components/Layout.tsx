import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Backpack,
  PackageOpen,
  Users,
  ClipboardCheck,
  Mountain,
} from 'lucide-react';

const navItems = [
  { to: '/', label: '物资分配', icon: Backpack },
  { to: '/supplies', label: '物资清单', icon: PackageOpen },
  { to: '/members', label: '队员档案', icon: Users },
  { to: '/checklist', label: '出发清单', icon: ClipboardCheck },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 bg-white border-r border-parchment-200 flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b border-parchment-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-card">
              <Mountain size={24} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-forest-800 leading-tight">
                徒步补给
              </h1>
              <p className="text-xs text-earth-600">分配管理系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                isActive ? 'nav-link-active' : 'nav-link'
              }
            >
              <item.icon size={19} strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-parchment-200">
          <div className="text-xs text-forest-500 space-y-1">
            <p className="font-medium text-forest-700">今日路线</p>
            <p>四段 · 约 18km</p>
            <p>累计爬升 1200m</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-x-hidden">
        <div className="h-16 bg-white/70 backdrop-blur-sm border-b border-parchment-200 sticky top-0 z-10 flex items-center px-8">
          <div>
            <h2 className="font-display text-xl font-bold text-forest-800">
              {navItems.find((n) =>
                n.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(n.to)
              )?.label || ''}
            </h2>
            <p className="text-xs text-earth-600">科学分配 · 安全徒步</p>
          </div>
        </div>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
