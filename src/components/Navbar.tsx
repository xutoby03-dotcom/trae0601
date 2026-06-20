import { Link, useLocation } from 'react-router-dom';
import { Palette, PackagePlus, Archive, Download } from 'lucide-react';
import { useModelStore } from '@/store/useModelStore';
import { exportData } from '@/utils/storage';

export const Navbar = () => {
  const location = useLocation();
  const { models } = useModelStore();
  const shelfCount = models.filter((m) => m.isOnShelf).length;

  const handleExport = () => {
    const state = useModelStore.getState();
    exportData({
      models: state.models,
      stages: state.stages,
      formulas: state.formulas,
      photos: state.photos,
      timers: state.timers,
    });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-studio-card border-b border-studio-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-studio-copper to-studio-copperDark rounded-lg flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-studio-text">模型涂装进度板</h1>
              <p className="text-xs text-studio-muted">Paint Tracker Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive('/')
                  ? 'bg-studio-copper text-white shadow-glow-copper'
                  : 'text-studio-muted hover:text-studio-text hover:bg-studio-border/50'
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              进度看板
            </Link>

            <Link
              to="/shelf"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 relative ${
                isActive('/shelf')
                  ? 'bg-studio-rust text-white'
                  : 'text-studio-muted hover:text-studio-text hover:bg-studio-border/50'
              }`}
            >
              <Archive className="w-4 h-4" />
              搁置区
              {shelfCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-studio-rust text-white text-xs rounded-full flex items-center justify-center animate-pulse-slow">
                  {shelfCount}
                </span>
              )}
            </Link>

            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-lg font-medium text-studio-muted hover:text-studio-text hover:bg-studio-border/50 transition-all duration-200 flex items-center gap-2"
              title="导出数据备份"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
