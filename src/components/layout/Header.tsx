import { NavLink, useLocation } from 'react-router-dom';
import { Package, Wrench, Home, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '材料看板', icon: Package },
  { path: '/after-sales', label: '售后管理', icon: Wrench },
  { path: '/rooms', label: '房间视图', icon: Home },
  { path: '/summary', label: '数据汇总', icon: BarChart3 },
];

const Header = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">装修材料管家</h1>
              <p className="text-xs text-gray-500 -mt-0.5">到货追踪 · 售后管理</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="hidden md:block">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold text-sm">
              装
            </div>
          </div>
        </div>
      </div>

      <nav className="md:hidden flex items-center justify-around py-2 border-t border-gray-100">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors',
                isActive ? 'text-teal-600' : 'text-gray-500'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
};

export default Header;
