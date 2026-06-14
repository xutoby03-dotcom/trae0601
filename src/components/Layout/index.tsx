import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  CloudRain,
  AlertTriangle,
  Package,
  BarChart3,
  Umbrella,
} from 'lucide-react';
import type { ReactNode } from 'react';

const navItems = [
  { path: '/', label: '总览看板', icon: LayoutDashboard },
  { path: '/points', label: '点位档案', icon: MapPin },
  { path: '/tasks', label: '雨天任务', icon: CloudRain },
  { path: '/issues', label: '问题处理', icon: AlertTriangle },
  { path: '/recovery', label: '回收管理', icon: Package },
  { path: '/statistics', label: '数据统计', icon: BarChart3 },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <Umbrella className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-slate-800 text-base">防滑垫看板</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600">管</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">保洁主管</p>
              <p className="text-xs text-slate-400">管理员</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="text-lg font-semibold text-slate-800">
            {navItems.find(
              (item) =>
                location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path))
            )?.label || '总览看板'}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </span>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
