import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Activity,
  Wrench,
  TrendingUp,
  Download,
  Heart,
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/records', label: '测量记录', icon: Activity },
  { path: '/device', label: '设备档案', icon: Wrench },
  { path: '/trends', label: '趋势分析', icon: TrendingUp },
  { path: '/export', label: '数据导出', icon: Download },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 hidden sm:block">血压管理</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 md:hidden z-40">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-400'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'scale-110 transition-transform')} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
