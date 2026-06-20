import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PackagePlus,
  ClipboardList,
  HandHeart,
  Bell,
  Package,
} from 'lucide-react';

const navItems = [
  { to: '/', label: '数据看板', icon: LayoutDashboard },
  { to: '/medicine-boxes', label: '药箱档案', icon: Package },
  { to: '/inventory', label: '库存管理', icon: PackagePlus },
  { to: '/borrows', label: '借用管理', icon: HandHeart },
  { to: '/reminders', label: '提醒中心', icon: Bell },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-full bg-zinc-50">
      <aside className="w-60 bg-white border-r border-zinc-200 flex flex-col">
        <div className="px-6 py-5 border-b border-zinc-100">
          <h1 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white">
              <ClipboardList className="w-5 h-5" />
            </span>
            便民药箱
          </h1>
          <p className="text-xs text-zinc-500 mt-1">社区活动室管理系统</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ' +
                  (isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900')
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-medium text-sm">
              管
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-900">管理员</p>
              <p className="text-xs text-zinc-500">社区活动室</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-auto">
          <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
