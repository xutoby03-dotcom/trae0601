import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Home, KeyRound, Bell, Settings, Plus, Key } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useMemo } from 'react';
import { cn } from '../utils/helpers';

const navItems = [
  { path: '/', label: '首页', icon: Home, emoji: '🏠' },
  { path: '/keys', label: '钥匙档案', icon: KeyRound, emoji: '🔑' },
  { path: '/reminders', label: '提醒中心', icon: Bell, emoji: '⏰' },
  { path: '/settings', label: '设置', icon: Settings, emoji: '⚙️' },
];

const Layout = () => {
  const location = useLocation();
  const unresolvedCount = useStore((s) => s.getUnresolvedRemindersCount());
  const unreadCount = useMemo(
    () => useStore.getState().reminders.filter((r) => !r.isRead && !r.isResolved).length,
    [useStore.getState().reminders]
  );
  const isRoot = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <header className="sticky top-0 z-40 bg-navy-600 text-white shadow-lg">
        <div className="container py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center shadow-glow-gold transition-transform group-hover:rotate-6">
              <Key className="w-6 h-6 text-navy-700" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold text-amber-400 leading-tight">
                钥匙管家
              </h1>
              <p className="text-xs text-navy-200 leading-tight">备用钥匙托管系统</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'relative px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-navy-500 text-amber-300 shadow-inner'
                        : 'text-navy-100 hover:bg-navy-500/50 hover:text-white'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.path === '/reminders' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-coral-400 text-white text-xs font-bold flex items-center justify-center px-1.5 animate-pulse-soft">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
            <Link
              to="/keys/new"
              className="ml-3 px-4 py-2 rounded-xl bg-amber-400 text-navy-700 text-sm font-semibold flex items-center gap-2 hover:bg-amber-500 transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>新增钥匙</span>
            </Link>
          </nav>

          <Link
            to="/keys/new"
            className="md:hidden w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-navy-700 shadow-md"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container py-6 pb-28 md:pb-10">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-cream-300 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={cn(
                  'relative py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors duration-200',
                  isActive ? 'text-navy-600' : 'text-navy-300 hover:text-navy-500'
                )}
              >
                <div className="relative">
                  <Icon className={cn('w-6 h-6', isActive && 'text-amber-500')} strokeWidth={isActive ? 2.5 : 2} />
                  {item.path === '/reminders' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-2 min-w-4 h-4 rounded-full bg-coral-400 text-white text-[10px] font-bold flex items-center justify-center px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
