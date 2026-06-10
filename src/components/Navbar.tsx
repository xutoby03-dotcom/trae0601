import { Bike, Plus, BarChart3, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform">
            <Bike className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            <span className="gradient-text">骑行路线</span>
            <span className="text-slate-300 ml-1">打卡</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              isActive('/') && !isActive('/stats') && !isActive('/create')
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="h-4 w-4" />
            首页
          </Link>
          <Link
            to="/stats"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
              isActive('/stats')
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            统计
          </Link>
        </div>

        <Link to="/create" className="btn-primary !py-2 !px-4 text-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">创建路线</span>
        </Link>
      </div>
    </nav>
  );
}
