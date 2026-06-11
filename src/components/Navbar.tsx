import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Plus, BarChart3, Home, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/stats', label: '统计', icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brown-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-warm group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
              试吃反馈板
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-brown-600 hover:text-primary-600 hover:bg-primary-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}

            <Link to="/publish">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                发布试吃
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-brown-600 hover:bg-brown-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-brown-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all',
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-brown-600 hover:bg-brown-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/publish"
              onClick={() => setMobileMenuOpen(false)}
              className="block"
            >
              <Button fullWidth>
                <Plus className="w-5 h-5 mr-2" />
                发布试吃
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
