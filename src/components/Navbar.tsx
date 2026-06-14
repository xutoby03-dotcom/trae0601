import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart3, History } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { getUnreadReminders } = useStore();
  const unreadCount = getUnreadReminders().length;

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/add', label: '添加', icon: PlusCircle },
    { path: '/stats', label: '统计', icon: BarChart3 },
    { path: '/history', label: '历史', icon: History },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-gray-200 shadow-lg md:top-0 md:bottom-auto">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="hidden md:flex items-center gap-2">
            <span className="text-2xl">🧺</span>
            <span className="font-bold text-lg font-display text-sky-600">晾衣管家</span>
          </Link>

          <div className="flex items-center justify-around w-full md:w-auto md:gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-sky-100 text-sky-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="relative">
                    <Icon size={20} />
                    {item.path === '/' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs md:text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
