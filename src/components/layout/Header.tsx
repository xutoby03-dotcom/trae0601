import { Coffee, Plus, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { cn } from '@/lib/utils';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-coffee-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-coffee-900 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Coffee className="w-6 h-6 text-coffee-50" />
            </div>
            <div className="text-left">
              <h1 className="font-serif text-xl font-bold text-coffee-900 leading-tight">
                咖啡盲测
              </h1>
              <p className="text-xs text-coffee-500">水质对比记录</p>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <Button
              variant={isHome ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">首页</span>
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/create')}
              className={cn(
                'flex items-center gap-2',
                isHome && 'animate-pulse-slow'
              )}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">新建盲测</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
