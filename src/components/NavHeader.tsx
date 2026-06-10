import { Link, useLocation } from 'react-router-dom';
import { Monitor, UserPlus, BarChart3, Settings, Store } from 'lucide-react';
import { useQueueStore } from '@/store/queueStore';
import { BUSINESS_TYPE_LABELS } from '@/types';

const navItems = [
  { path: '/', icon: <Monitor className="w-5 h-5" />, label: '排队大屏' },
  { path: '/ticket', icon: <UserPlus className="w-5 h-5" />, label: '取号' },
  { path: '/staff', icon: <Settings className="w-5 h-5" />, label: '管理' },
  { path: '/stats', icon: <BarChart3 className="w-5 h-5" />, label: '统计' },
];

export default function NavHeader() {
  const location = useLocation();
  const { queue } = useQueueStore();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-dark-950/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-lg">
                {queue?.businessName || BUSINESS_TYPE_LABELS[queue?.businessType || 'haircut']}
              </div>
              <div className="text-xs text-white/50">
                {queue && BUSINESS_TYPE_LABELS[queue.businessType]}
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <nav className="flex md:hidden items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
