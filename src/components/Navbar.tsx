import { Link, useLocation } from 'react-router-dom';
import { Home, List, AlertTriangle, BarChart3, Pill } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/medicines', label: '全部药品', icon: List },
  { path: '/pending', label: '待处理', icon: AlertTriangle },
  { path: '/statistics', label: '统计', icon: BarChart3 },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-display text-2xl leading-tight">家庭小药箱</h1>
                <p className="text-xs text-white/80">库存管家 · 安心常备</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all',
                      active
                        ? 'bg-white text-primary-600 shadow-md'
                        : 'text-white/90 hover:bg-white/20'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-4 py-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={clsx(
                  'flex flex-col items-center gap-1 py-2 transition-colors',
                  active ? 'text-primary-600' : 'text-gray-500'
                )}
              >
                <Icon className={clsx('w-5 h-5', active && 'animate-bounce-subtle')} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
