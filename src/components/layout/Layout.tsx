import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  Users,
  Plane,
  Heart,
  Package,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/', label: '首页概览', icon: LayoutDashboard },
  { to: '/medicines', label: '药品档案', icon: Pill },
  { to: '/family', label: '家庭成员', icon: Users },
  { to: '/trips', label: '我的旅行', icon: Plane },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex grain-bg">
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/60 bg-white/70 backdrop-blur-xl sticky top-0 h-screen">
        <div className="p-6 pb-4 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-200/50">
              <Package className="text-white" size={22} />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-slate-900 leading-tight">
                旅行药箱
              </h1>
              <p className="text-xs text-slate-500">家庭健康管家</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-medium text-slate-400 px-3 mb-2 mt-2 uppercase tracking-wider">
            主菜单
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-brand-400/10 to-brand-500/5 text-brand-700 shadow-sm border border-brand-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon
                  size={18}
                  className={clsx(
                    'transition-colors',
                    isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-sand-100 to-sand-50 border border-sand-200/60 relative overflow-hidden">
            <Heart
              className="absolute -right-2 -top-2 text-sand-300/50"
              size={60}
            />
            <div className="relative">
              <p className="font-display font-bold text-slate-800 mb-1">
                旅途愉快！
              </p>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                出行前检查清单，别让小病痛破坏好心情
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-100 safe-area-pb">
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-all',
                  isActive ? 'text-brand-600' : 'text-slate-500'
                )}
              >
                <Icon
                  size={22}
                  className={clsx(isActive && 'text-brand-500')}
                />
                {item.label.slice(0, 2)}
              </NavLink>
            );
          })}
        </div>
      </div>

      <main className="flex-1 min-w-0 pb-24 lg:pb-0">
        <div className="container py-6 lg:py-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
