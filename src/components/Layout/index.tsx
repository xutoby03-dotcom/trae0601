import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  AlertCircle,
  Wrench,
  Menu,
  X,
  Camera,
} from 'lucide-react';
import { cn } from '@/utils';

const navItems = [
  { path: '/', label: '数据看板', icon: LayoutDashboard },
  { path: '/facilities', label: '设施档案', icon: Building2 },
  { path: '/inspections', label: '巡检管理', icon: ClipboardCheck },
  { path: '/issues', label: '问题中心', icon: AlertCircle },
  { path: '/repairs', label: '维修记录', icon: Wrench },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 bg-white/90 backdrop-blur-lg border-r border-gray-100 shadow-sm transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-glow">
              <Camera className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-display text-lg text-gray-800 leading-tight">滑梯巡检</h1>
                <p className="text-xs text-gray-500">安全守护每一天</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4 text-gray-500" /> : <Menu className="w-4 h-4 text-gray-500" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-400 text-white shadow-glow'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Quick report link */}
        <div className="absolute bottom-4 left-3 right-3">
          <Link
            to="/issues/new"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl font-medium bg-gradient-to-r from-secondary-500 to-secondary-400 text-white shadow-card hover:shadow-glow transition-all duration-200',
              !sidebarOpen && 'justify-center'
            )}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>我要上报问题</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
          <div>
            <h2 className="font-display text-xl text-gray-800">
              {navItems.find((n) => n.path === location.pathname)?.label || '儿童滑梯巡检系统'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden md:inline">管理员</span>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-medium">
              管
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
