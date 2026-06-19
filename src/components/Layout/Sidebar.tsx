import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: '看板总览', icon: LayoutDashboard },
  { path: '/members', label: '成员档案', icon: Users },
  { path: '/plans', label: '餐厅方案', icon: UtensilsCrossed },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 shadow-sm z-40">
      <div className="p-6 border-b border-slate-100">
        <h1 className="font-display text-2xl font-bold text-primary-700">
          桌餐忌口
        </h1>
        <p className="text-xs text-slate-500 mt-1">确认系统</p>
      </div>

      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      'transition-colors',
                      isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
        <div className="bg-gradient-to-br from-primary-50 to-teal-50 rounded-xl p-4">
          <p className="text-sm font-medium text-primary-700 mb-1">💡 小提示</p>
          <p className="text-xs text-slate-600">
            先录入成员档案，再创建餐厅方案，最后智能分桌并导出清单。
          </p>
        </div>
      </div>
    </aside>
  );
}
