import { Shirt, BarChart3, Search, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Header() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '样衣档案', icon: Shirt },
    { path: '/dashboard', label: '数据看板', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cream-200 bg-white/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-charcoal-700">
              <Shirt className="h-5 w-5 text-cream-50" />
            </div>
            <span className="font-display text-lg font-semibold text-charcoal-800">
              Atelier <span className="text-charcoal-400">|</span> 样衣试穿记录
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
                    isActive
                      ? 'bg-cream-100 text-charcoal-800'
                      : 'text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="搜索样衣、款号..."
              className="w-64 pl-9 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-md text-sm text-charcoal-700 placeholder-charcoal-400 focus:outline-none focus:border-charcoal-300 focus:bg-white transition-all duration-200"
            />
          </div>

          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100 hover:bg-cream-200 transition-colors duration-200">
            <User className="h-5 w-5 text-charcoal-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
