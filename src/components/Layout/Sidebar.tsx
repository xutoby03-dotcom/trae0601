import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  AlertTriangle,
  FireExtinguisher
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const menuItems = [
  { path: '/dashboard', label: '数据看板', icon: LayoutDashboard },
  { path: '/devices', label: '设备档案', icon: FileText },
  { path: '/inspections', label: '巡检记录', icon: ClipboardList },
  { path: '/rectifications', label: '整改管理', icon: AlertTriangle }
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
          <FireExtinguisher className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold">灭火器点检</h1>
          <p className="text-xs text-white/60">消防设备管理系统</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                twMerge(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-white/10 text-white shadow-inner'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-bold">
            管
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">系统管理员</p>
            <p className="truncate text-xs text-white/60">admin@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
