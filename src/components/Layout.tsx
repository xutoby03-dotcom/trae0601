import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, DoorOpen, FileText, BarChart3, Clock, User } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useEffect, useState } from 'react';

const navItems = [
  { path: '/', label: '看板', icon: LayoutDashboard },
  { path: '/queue', label: '排队管理', icon: Users },
  { path: '/rooms', label: '试衣间管理', icon: DoorOpen },
  { path: '/records', label: '试衣记录', icon: FileText },
  { path: '/stats', label: '数据统计', icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { fetchAll, checkTimeouts, error, clearError } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      checkTimeouts();
    }, 1000);
    return () => clearInterval(interval);
  }, [fetchAll, checkTimeouts]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAll();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return (
    <div className="min-h-screen bg-gradient-luxury">
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <span>{error}</span>
          <button onClick={clearError} className="ml-2 hover:text-red-200">×</button>
        </div>
      )}

      <header className="bg-charcoal-800/90 backdrop-blur-sm border-b border-champagne-400/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-display text-2xl text-champagne-400 tracking-wider">
              LUXURY FITTING
            </h1>
            <span className="text-cream-300 text-sm">精品服饰试衣管理系统</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-cream-200">
              <Clock className="w-5 h-5 text-champagne-400" />
              <span className="font-medium">
                {currentTime.toLocaleString('zh-CN', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-cream-200 border-l border-cream-600 pl-6">
              <User className="w-5 h-5 text-champagne-400" />
              <span>导购在线</span>
              <span className="bg-green-500 w-2 h-2 rounded-full"></span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <nav className="w-56 min-h-[calc(100vh-72px)] bg-charcoal-800/50 border-r border-champagne-400/10 py-6">
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-burgundy-700 text-white shadow-lg shadow-burgundy-700/30'
                      : 'text-cream-300 hover:bg-charcoal-700/50 hover:text-champagne-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
