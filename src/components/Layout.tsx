import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  KeyRound,
  ClipboardList,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils.js';

const navItems = [
  { path: '/dashboard', label: '数据看板', icon: LayoutDashboard },
  { path: '/rooms', label: '房间管理', icon: KeyRound },
  { path: '/borrows', label: '借用记录', icon: ClipboardList },
  { path: '/exceptions', label: '异常处理', icon: AlertTriangle },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-30 w-60 bg-gradient-to-b from-teal-700 to-teal-900 text-white transition-all duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20',
        )}
      >
        <div className="p-5 flex items-center justify-between border-b border-teal-600/50">
          <div
            className={cn(
              'flex items-center gap-3 overflow-hidden',
              sidebarOpen ? 'w-40' : 'w-0 lg:w-full lg:justify-center',
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <span className={cn('font-bold text-lg whitespace-nowrap', !sidebarOpen && 'lg:hidden')}>
              钥匙管理
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-white/15 text-white shadow-lg shadow-teal-900/30'
                    : 'text-teal-100/80 hover:bg-white/10 hover:text-white',
                  !sidebarOpen && 'lg:justify-center lg:px-2',
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className={cn('text-sm font-medium', !sidebarOpen && 'lg:hidden')}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 z-40 p-2 bg-white rounded-lg shadow-md lg:hidden"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
      )}

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-20 z-10">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-800">
              {navItems.find((item) => location.pathname.startsWith(item.path))?.label || '数据看板'}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>系统运行中</span>
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
