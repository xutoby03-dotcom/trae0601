import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Package,
  ClipboardCheck,
  ListTodo,
  BarChart3,
  QrCode,
} from 'lucide-react';
import { cn } from '@/utils/helpers';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/rooms', label: '会议室', icon: Building2 },
  { path: '/inventory', label: '库存管理', icon: Package },
  { path: '/inspection', label: '巡检中心', icon: ClipboardCheck },
  { path: '/tasks', label: '补给任务', icon: ListTodo },
  { path: '/statistics', label: '统计报表', icon: BarChart3 },
  { path: '/feedback', label: '扫码反馈', icon: QrCode },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-gradient-to-b from-primary-800 to-primary-900 h-screen fixed left-0 top-0 text-white flex flex-col">
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">白板补给系统</h1>
            <p className="text-xs text-white/60">会议室用品管理</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'text-primary-300')} />
              {item.label}
              {item.path === '/tasks' && (
                <span className="ml-auto bg-accent-500 text-white text-xs px-2 py-0.5 rounded-full">
                  待办
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
            管
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">行政管理员</p>
            <p className="text-xs text-white/50">admin@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
