import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  Calendar,
  Droplets,
  AlertTriangle,
  User,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../store/useStore.js';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '看板首页' },
  { path: '/garden-beds', icon: Sprout, label: '菜畦档案' },
  { path: '/schedule', icon: Calendar, label: '排班管理' },
  { path: '/check-in', icon: Droplets, label: '打卡记录' },
  { path: '/anomalies', icon: AlertTriangle, label: '异常中心' },
  { path: '/profile', icon: User, label: '个人中心' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { currentUser } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-cream-500 flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-cream-300 transition-all duration-300 flex flex-col shadow-soft z-20`}
      >
        <div className="p-4 border-b border-cream-200 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <span className="text-3xl">🌱</span>
              <h1 className="font-serif font-bold text-lg text-primary-600">共享菜园</h1>
            </div>
          )}
          {!sidebarOpen && <span className="text-3xl mx-auto">🌱</span>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-cream-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="sidebar-link group"
                data-active={isActive}
              >
                <Icon size={20} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight size={16} className="text-primary-500" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {currentUser && (
          <div className="p-3 border-t border-cream-200">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${sidebarOpen ? '' : 'justify-center'} bg-gradient-to-r from-primary-50 to-cream-100`}>
              <div className="w-10 h-10 rounded-full border-2 border-primary-300 bg-primary-100 flex items-center justify-center text-xl">
                👨‍🌾
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-forest-800 truncate">{currentUser.name}</p>
                  <p className="text-xs text-forest-600">浇水 {currentUser.totalWaterings} 次</p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white/80 backdrop-blur-sm border-b border-cream-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-semibold text-forest-900">
                {navItems.find((item) => item.path === location.pathname)?.label || '共享菜园'}
              </h2>
              <p className="text-sm text-forest-600 mt-0.5">
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto animate-fade-in">{children}</div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
