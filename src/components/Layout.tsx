import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Thermometer,
  QrCode,
  Snowflake,
} from 'lucide-react';
import { classNames } from '@/utils/helpers';

const navItems = [
  { to: '/dashboard', label: '数据看板', icon: LayoutDashboard },
  { to: '/products', label: '团品档案', icon: Package },
  { to: '/orders', label: '居民订单', icon: ClipboardList },
  { to: '/inspection', label: '到货验收', icon: Thermometer },
  { to: '/pickup', label: '取货确认', icon: QrCode },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex">
        {/* 侧边栏 */}
        <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-800/60 bg-slate-900/50 backdrop-blur-xl z-20">
          <div className="flex flex-col h-full">
            {/* Logo区域 */}
            <div className="px-6 py-6 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-500/25">
                  <Snowflake className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-wide">冷链交接</h1>
                  <p className="text-xs text-slate-400">冷冻品管理系统</p>
                </div>
              </div>
            </div>

            {/* 导航 */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={classNames(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-sky-500/20 to-cyan-500/10 text-sky-300 border border-sky-500/30 shadow-lg shadow-sky-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    )}
                  >
                    <Icon className={classNames('w-5 h-5', isActive && 'text-sky-400')} />
                    {item.label}
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* 底部状态 */}
            <div className="px-4 py-4 border-t border-slate-800/60">
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-800/40">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">团长工作台</p>
                  <p className="text-[10px] text-slate-500">系统运行正常</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 主内容区 */}
        <main className="ml-64 flex-1 min-h-screen">
          <div className="px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
