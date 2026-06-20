import { Link, useLocation } from 'react-router-dom';
import { Map, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

const pageTitles: Record<string, string> = {
  '/': '首页',
  '/routes': '路线管理',
  '/routes/new': '新建路线',
};

export default function Header({ title }: HeaderProps) {
  const location = useLocation();

  let displayTitle = title;
  if (!displayTitle) {
    displayTitle = pageTitles[location.pathname];
    if (!displayTitle) {
      if (location.pathname.match(/^\/routes\/[^/]+\/edit$/)) {
        displayTitle = '编辑路线';
      } else if (location.pathname.match(/^\/guide\/[^/]+$/)) {
        displayTitle = '讲解中';
      } else if (location.pathname.match(/^\/report\/[^/]+$/)) {
        displayTitle = '讲解报告';
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-deep-900 text-white shadow-lg">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-museum-500 flex items-center justify-center group-hover:bg-museum-400 transition-colors">
            <Map className="w-6 h-6 text-deep-900" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-serif font-bold tracking-wide">展言</span>
            <span className="text-xs text-deep-300">展馆讲解计时器</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {displayTitle && (
            <h1 className="text-lg font-medium text-museum-300 hidden md:block">
              {displayTitle}
            </h1>
          )}

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                location.pathname === '/'
                  ? 'bg-museum-500/20 text-museum-300'
                  : 'text-deep-200 hover:bg-deep-800 hover:text-white'
              )}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">概览</span>
            </Link>
            <Link
              to="/routes"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                location.pathname.startsWith('/routes')
                  ? 'bg-museum-500/20 text-museum-300'
                  : 'text-deep-200 hover:bg-deep-800 hover:text-white'
              )}
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">路线</span>
            </Link>
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-deep-300'
              )}
            >
              <Clock className="w-4 h-4" />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
