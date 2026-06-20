import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useUserStore } from '@/store';
import { cn } from '@/utils/helpers';
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  Settings,
  ClipboardCheck,
  User,
  Mountain,
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { role, userName, toggleRole } = useUserStore();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: '墙面总览' },
    { path: '/patrol', icon: Search, label: '巡场记录' },
    { path: '/feedback', icon: MessageSquare, label: '顾客反馈' },
    { path: '/routes', icon: Settings, label: '线路管理' },
    { path: '/review', icon: ClipboardCheck, label: '反馈复核' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex min-h-screen">
        <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col flex-shrink-0">
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Mountain size={22} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">岩点管理</h1>
                <p className="text-xs text-slate-500">抱石线路管理系统</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-orange-500/20 text-orange-400 shadow-sm'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button
              onClick={toggleRole}
              className="w-full flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center">
                <User size={18} className="text-slate-400" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white">{userName}</div>
                <div className="text-xs text-slate-500">
                  点击切换为{role === 'staff' ? '开线人' : '工作人员'}
                </div>
              </div>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
