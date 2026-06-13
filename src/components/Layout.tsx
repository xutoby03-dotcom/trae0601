import React from 'react';
import {
  LayoutDashboard,
  Printer,
  ClipboardList,
  Package,
  AlertTriangle,
  BarChart3,
  Menu,
  X,
  Bell,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/printers', label: '打印点管理', icon: Printer },
  { path: '/consumptions', label: '领用记录', icon: ClipboardList },
  { path: '/replenishments', label: '补货管理', icon: Package },
  { path: '/alerts', label: '库存预警', icon: AlertTriangle },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();
  const { alerts } = useAppStore();

  const unresolvedAlerts = alerts.filter((a) => !a.isResolved).length;

  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">打印纸管理</h1>
              <p className="text-xs text-gray-500">智能库存系统</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5 mr-3 transition-colors',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {item.path === '/alerts' && unresolvedAlerts > 0 && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-bold rounded-full',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-red-100 text-red-600'
                    )}
                  >
                    {unresolvedAlerts}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="ml-4 lg:ml-0">
                <h2 className="text-xl font-bold text-gray-900">
                  {navItems.find((n) => n.path === location.pathname)?.label ||
                    '仪表盘'}
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5" />
                {unresolvedAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-breathe" />
                )}
              </button>
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  管
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">管理员</p>
                  <p className="text-xs text-gray-500">admin@company.com</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
